import {
    createBatch,
    uploadChunk,
    getFile,
    getChunk,
    list,
    isUserRegistered
} from '$lib/api/file-store-bucket.api';
import type { BatchArg, FileInfo } from '../../../../declarations/file_store_bucket/file_store_bucket.did';

// ================================
// TYPES AND INTERFACES
// ================================

/**
 * Configuration for chunk processing
 */
const CHUNK_SIZE = 1.9 * 1024 * 1024; // 1.9MB - safe limit for the file store bucket
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_MAX_SIZE = 20;

/**
 * Result type for upload operations
 */
export interface UploadResult {
    success: boolean;
    error?: string;
    fileName?: string;
}

/**
 * Progress callback type - receives percentage (0-100)
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Error types for better error handling
 */
export enum FileStoreError {
    INVALID_FILE = 'Invalid file provided',
    UPLOAD_FAILED = 'Failed to upload file',
    DOWNLOAD_FAILED = 'Failed to download file',
    FILE_NOT_FOUND = 'File not found',
    CHUNKING_FAILED = 'Failed to process file chunks',
    HASH_CALCULATION_FAILED = 'Failed to calculate file hash',
    USER_NOT_REGISTERED = 'User not registered'
}

// ================================
// MEMORY CACHE IMPLEMENTATION
// ================================

/**
 * Simple memory cache for downloaded files with LRU-like behavior
 * Automatically manages memory by limiting the number of cached files
 */
class FileCache {
    private cache = new Map<string, File>();
    private accessOrder = new Set<string>();

    /**
     * Store a file in cache with size limit enforcement
     */
    set(fileName: string, file: File): void {
        // Remove from access order if it exists
        if (this.cache.has(fileName)) {
            this.accessOrder.delete(fileName);
        }

        // If at capacity, remove the least recently accessed file
        if (this.cache.size >= CACHE_MAX_SIZE) {
            const oldestKey = this.accessOrder.values().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
                this.accessOrder.delete(oldestKey);
            }
        }

        // Add the new file
        this.cache.set(fileName, file);
        this.accessOrder.add(fileName);
    }

    /**
     * Retrieve a file from cache and update access order
     */
    get(fileName: string): File | undefined {
        const file = this.cache.get(fileName);
        if (file) {
            // Update access order
            this.accessOrder.delete(fileName);
            this.accessOrder.add(fileName);
        }
        return file;
    }

    /**
     * Check if file exists in cache
     */
    has(fileName: string): boolean {
        return this.cache.has(fileName);
    }

    /**
     * Remove a specific file from cache
     */
    delete(fileName: string): boolean {
        this.accessOrder.delete(fileName);
        return this.cache.delete(fileName);
    }

    /**
     * Clear all cached files
     */
    clear(): void {
        this.cache.clear();
        this.accessOrder.clear();
    }

    /**
     * Get current cache size
     */
    size(): number {
        return this.cache.size;
    }
}

// Global cache instance
const fileCache = new FileCache();

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Convert a Blob/File to Uint8Array for upload
 */
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

/**
 * Calculate SHA-256 hash of a file
 */
async function calculateFileHash(file: File): Promise<Uint8Array> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        return new Uint8Array(hashBuffer);
    } catch (error) {
        throw new Error(`${FileStoreError.HASH_CALCULATION_FAILED}: ${error}`);
    }
}

/**
 * Calculate SHA-256 hash of a chunk
 */
async function calculateChunkHash(chunk: Uint8Array): Promise<Uint8Array> {
    try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', chunk);
        return new Uint8Array(hashBuffer);
    } catch (error) {
        throw new Error(`${FileStoreError.HASH_CALCULATION_FAILED}: ${error}`);
    }
}

/**
 * Split file into chunks based on CHUNK_SIZE
 */
async function createFileChunks(file: File): Promise<Uint8Array[]> {
    try {
        const chunks: Uint8Array[] = [];

        // If file is smaller than chunk size, treat as single chunk
        if (file.size <= CHUNK_SIZE) {
            const chunk = await blobToUint8Array(file);
            chunks.push(chunk);
        } else {
            // Split file into multiple chunks
            let offset = 0;
            while (offset < file.size) {
                const chunkBlob = file.slice(offset, offset + CHUNK_SIZE);
                const chunk = await blobToUint8Array(chunkBlob);
                chunks.push(chunk);
                offset += CHUNK_SIZE;
            }
        }

        return chunks;
    } catch (error) {
        throw new Error(`${FileStoreError.CHUNKING_FAILED}: ${error}`);
    }
}

/**
 * Combine chunks back into a File object
 */
function combineChunksToFile(
    chunks: Array<Uint8Array | number[]>,
    fileName: string,
    contentType: string
): File {
    // Calculate total length
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

    // Create combined array
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        if (chunk instanceof Uint8Array) {
            combinedArray.set(chunk, offset);
        } else {
            combinedArray.set(new Uint8Array(chunk), offset);
        }
        offset += chunk.length;
    }

    // Create and return File object
    const blob = new Blob([combinedArray], { type: contentType });
    return new File([blob], fileName, { type: contentType });
}

/**
 * Retry wrapper for async operations
 */
async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = MAX_RETRY_ATTEMPTS,
    errorMessage: string = 'Operation failed'
): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                break;
            }
            // Wait a bit before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
    }

    throw new Error(`${errorMessage} after ${maxAttempts} attempts: ${lastError}`);
}

// ================================
// MAIN SERVICE FUNCTIONS
// ================================

/**
 * Upload a file to the file store bucket with automatic chunking
 * 
 * @param file - The file to upload (must be a valid File object)
 * @param fileName - Optional custom name for the file (defaults to file.name)
 * @param onProgress - Optional callback to track upload progress (0-100%)
 * @returns Promise with upload result
 * 
 * @example
 * ```typescript
 * const result = await uploadFile(file, 'my-document.pdf', (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * 
 * if (result.success) {
 *   console.log('File uploaded successfully!');
 * } else {
 *   console.error('Upload failed:', result.error);
 * }
 * ```
 */
export async function uploadFile(
    file: File,
    fileName?: string,
    onProgress?: ProgressCallback
): Promise<UploadResult> {
    try {

        if (!file || !(file instanceof File)) {
            console.error('File validation failed:', { file, isFileInstance: file instanceof File });
            return { success: false, error: FileStoreError.INVALID_FILE };
        }

        // Check if user is registered
        let registered;
        try {
            registered = await isUserRegistered();
        } catch (error) {
            console.error('Error checking user registration:', error);
            return { success: false, error: `Registration check failed: ${error}` };
        }

        if (!registered) {
            return { success: false, error: FileStoreError.USER_NOT_REGISTERED };
        }
        const finalFileName = fileName || file.name;

        // Step 1: Create file chunks
        const chunks = await createFileChunks(file);
        const totalSteps = 1 + chunks.length; // 1 for createBatch + number of chunks
        let completedSteps = 0;

        // Step 2: Calculate file and chunk hashes
        const [fileHash, chunkHashes] = await Promise.all([
            calculateFileHash(file),
            Promise.all(chunks.map(calculateChunkHash))
        ]);

        // Step 3: Create batch with retry
        const batchArgs: BatchArg = {
            sha256: [fileHash],
            contentType: file.type,
            chunksSha256: chunkHashes,
            name: finalFileName
        };

        const batchId = await withRetry(
            () => createBatch(batchArgs),
            MAX_RETRY_ATTEMPTS,
            'Failed to create batch'
        );

        // Update progress after batch creation
        completedSteps++;
        const progressAfterBatch = Math.round((completedSteps / totalSteps) * 100);
        onProgress?.(progressAfterBatch);

        // Step 4: Upload chunks with retry and progress tracking
        for (const chunk of chunks) {
            await withRetry(
                () => uploadChunk(chunk, batchId),
                MAX_RETRY_ATTEMPTS,
                'Failed to upload chunk'
            );

            // Update progress after each chunk
            completedSteps++;
            const currentProgress = Math.round((completedSteps / totalSteps) * 100);
            onProgress?.(currentProgress);
        }

        return {
            success: true,
            fileName: finalFileName
        };

    } catch (error) {

        console.error('Upload failed:', error);
        return {
            success: false,
            error: `${FileStoreError.UPLOAD_FAILED}: ${error}`
        };
    }
}

/**
 * Download a file from the file store bucket with automatic chunk reconstruction
 * Uses memory cache to avoid re-downloading the same file
 * 
 * @param fileName - Name of the file to download
 * @param onProgress - Optional callback to track download progress (0-100%)
 * @returns Promise with the reconstructed File object
 * 
 * @example
 * ```typescript
 * const file = await downloadFile('my-document.pdf', (progress) => {
 *   console.log(`Download progress: ${progress}%`);
 * });
 * 
 * // Use the file (e.g., for images)
 * const imageUrl = URL.createObjectURL(file);
 * imageElement.src = imageUrl;
 * ```
 */
export async function downloadFile(
    fileName: string,
    onProgress?: ProgressCallback
): Promise<File> {
    try {
        // Check cache first
        if (fileCache.has(fileName)) {
            onProgress?.(100); // Instant progress for cached files
            return fileCache.get(fileName)!;
        }

        // Step 1: Get first chunk and file info
        const firstResponse = await withRetry(
            () => getFile(fileName),
            MAX_RETRY_ATTEMPTS,
            'Failed to get file info'
        );

        const { modified, content, sha256, chunks_left, content_type } = firstResponse;
        const chunksLeft = Number(chunks_left);
        const totalChunks = chunksLeft + 1; // +1 for the first chunk we already have
        let downloadedChunks = 1;

        // Update progress after first chunk
        onProgress?.(Math.round((downloadedChunks / totalChunks) * 100));

        // Step 2: Collect all chunks
        const allChunks: Array<Uint8Array | number[]> = [content];

        // Step 3: Download remaining chunks if any
        for (let i = 1; i <= chunksLeft; i++) {
            const chunkResponse = await withRetry(
                () => getChunk(fileName, BigInt(i)),
                MAX_RETRY_ATTEMPTS,
                `Failed to get chunk ${i}`
            );

            allChunks.push(chunkResponse.content);
            downloadedChunks++;

            // Update progress after each chunk
            onProgress?.(Math.round((downloadedChunks / totalChunks) * 100));
        }

        // Step 4: Reconstruct file
        const reconstructedFile = combineChunksToFile(allChunks, fileName, content_type);

        // Step 5: Cache the file for future use
        fileCache.set(fileName, reconstructedFile);

        return reconstructedFile;

    } catch (error) {
        throw new Error(`${FileStoreError.DOWNLOAD_FAILED}: ${error}`);
    }
}

/**
 * Get file information without downloading the actual content
 * 
 * @param fileName - Name of the file
 * @returns Promise with file information
 */
export async function getFileInfo(fileName: string): Promise<FileInfo> {
    try {
        const response = await withRetry(
            () => getFile(fileName),
            MAX_RETRY_ATTEMPTS,
            'Failed to get file info'
        );

        // Extract basic file info
        const fileInfo: FileInfo = {
            file_name: fileName,
            content_type: response.content_type,
            size: BigInt(response.content.length + Number(response.chunks_left)),
            modified: response.modified,
            sha256: response.sha256,
            nos_chunks: response.chunks_left + BigInt(1)
        };

        return fileInfo;
    } catch (error) {
        throw new Error(`${FileStoreError.FILE_NOT_FOUND}: ${error}`);
    }
}

/**
 * List all files stored in the file store bucket
 * 
 * @returns Promise with array of file information
 */
export async function listFiles(): Promise<Array<FileInfo>> {
    try {
        return await withRetry(
            () => list(),
            MAX_RETRY_ATTEMPTS,
            'Failed to list files'
        );
    } catch (error) {
        throw new Error(`Failed to list files: ${error}`);
    }
}

/**
 * Check if the current user is registered with the file store bucket
 * 
 * @returns Promise with registration status
 */
export async function checkUserRegistration(): Promise<boolean> {
    try {
        return await isUserRegistered();
    } catch (error) {
        console.error('Failed to check user registration:', error);
        return false;
    }
}

/**
 * Clear all cached files from memory
 * Useful for freeing up memory or ensuring fresh downloads
 */
export function clearFileCache(): void {
    fileCache.clear();
}

/**
 * Get current cache statistics
 * 
 * @returns Object with cache information
 */
export function getCacheStats(): { size: number; maxSize: number } {
    return {
        size: fileCache.size(),
        maxSize: CACHE_MAX_SIZE
    };
}

/**
 * Remove a specific file from cache
 * 
 * @param fileName - Name of the file to remove from cache
 * @returns True if file was in cache and removed, false otherwise
 */
export function removeFromCache(fileName: string): boolean {
    return fileCache.delete(fileName);
}

// ================================
// CLEANUP ON PAGE UNLOAD
// ================================

// Automatically clear cache when page is unloaded to free memory
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        clearFileCache();
    });
}
