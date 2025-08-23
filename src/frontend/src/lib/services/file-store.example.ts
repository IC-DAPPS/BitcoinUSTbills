/**
 * Example usage of the File Store Service
 * 
 * This file demonstrates how to use the file store service functions
 * for uploading, downloading, and managing files in your Svelte components.
 */

import {
    uploadFile,
    downloadFile,
    listFiles,
    getFileInfo,
    clearFileCache,
    getCacheStats,
    checkUserRegistration
} from './file-store.service';

// ================================
// UPLOAD EXAMPLES
// ================================

/**
 * Example: Basic file upload without progress tracking
 */
export async function basicUploadExample(file: File): Promise<void> {
    try {
        const result = await uploadFile(file);

        if (result.success) {
            console.log('✅ File uploaded successfully!', result.fileName);
        } else {
            console.error('❌ Upload failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Upload error:', error);
    }
}

/**
 * Example: File upload with custom name and progress tracking
 */
export async function uploadWithProgressExample(file: File, customName?: string): Promise<void> {
    try {
        const result = await uploadFile(
            file,
            customName,
            (progress) => {
                console.log(`📤 Upload progress: ${progress}%`);
                // Update your UI here
                // progressBar.style.width = `${progress}%`;
                // progressText.textContent = `${progress}%`;
            }
        );

        if (result.success) {
            console.log('✅ Upload completed!', result.fileName);
        } else {
            console.error('❌ Upload failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Upload error:', error);
    }
}

// ================================
// DOWNLOAD EXAMPLES
// ================================

/**
 * Example: Download file and display as image
 */
export async function downloadAndDisplayImageExample(fileName: string): Promise<string | null> {
    try {
        const file = await downloadFile(fileName, (progress) => {
            console.log(`📥 Download progress: ${progress}%`);
        });

        // Create URL for displaying in HTML
        const imageUrl = URL.createObjectURL(file);

        // Usage in HTML: <img src={imageUrl} alt="Downloaded file" />
        console.log('✅ File downloaded and URL created:', imageUrl);
        return imageUrl;

    } catch (error) {
        console.error('❌ Download failed:', error);
        return null;
    }
}

/**
 * Example: Download file and trigger browser download
 */
export async function downloadAndSaveExample(fileName: string): Promise<void> {
    try {
        const file = await downloadFile(fileName);

        // Create download link
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up URL
        URL.revokeObjectURL(url);

        console.log('✅ File download triggered for:', file.name);
    } catch (error) {
        console.error('❌ Download failed:', error);
    }
}

// ================================
// FILE MANAGEMENT EXAMPLES
// ================================

/**
 * Example: List all stored files
 */
export async function listAllFilesExample(): Promise<void> {
    try {
        const files = await listFiles();

        console.log(`📁 Found ${files.length} files:`);
        files.forEach(file => {
            console.log(`  - ${file.file_name} (${file.content_type}, ${file.size} bytes)`);
        });
    } catch (error) {
        console.error('❌ Failed to list files:', error);
    }
}

/**
 * Example: Get file information without downloading
 */
export async function getFileDetailsExample(fileName: string): Promise<void> {
    try {
        const fileInfo = await getFileInfo(fileName);

        console.log('📋 File information:');
        console.log(`  Name: ${fileInfo.file_name}`);
        console.log(`  Type: ${fileInfo.content_type}`);
        console.log(`  Size: ${fileInfo.size} bytes`);
        console.log(`  Chunks: ${fileInfo.nos_chunks}`);
        console.log(`  Modified: ${new Date(Number(fileInfo.modified) / 1000000)}`);
    } catch (error) {
        console.error('❌ Failed to get file info:', error);
    }
}

// ================================
// CACHE MANAGEMENT EXAMPLES
// ================================

/**
 * Example: Check cache status and clear if needed
 */
export function manageCacheExample(): void {
    const stats = getCacheStats();

    console.log(`💾 Cache stats: ${stats.size}/${stats.maxSize} files cached`);

    if (stats.size > 15) { // Clear cache if getting full
        clearFileCache();
        console.log('🧹 Cache cleared to free memory');
    }
}

// ================================
// USER REGISTRATION EXAMPLE
// ================================

/**
 * Example: Check if user is registered before operations
 */
export async function checkUserStatusExample(): Promise<boolean> {
    try {
        const isRegistered = await checkUserRegistration();

        if (isRegistered) {
            console.log('✅ User is registered and can use file store');
            return true;
        } else {
            console.log('❌ User not registered - please register first');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to check registration:', error);
        return false;
    }
}

// ================================
// SVELTE COMPONENT USAGE EXAMPLE
// ================================

/**
 * Example Svelte component code showing practical usage
 */
export const svelteComponentExample = `
<script lang="ts">
  import { uploadFile, downloadFile } from '$lib/services/file-store.service';
  
  let files: FileList;
  let uploadProgress = 0;
  let downloading = false;
  let imageUrl = '';

  // Handle file upload
  async function handleUpload() {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadProgress = 0;
    
    try {
      const result = await uploadFile(file, undefined, (progress) => {
        uploadProgress = progress;
      });
      
      if (result.success) {
        alert('Upload successful!');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Upload error: ' + error);
    }
  }

  // Handle file download
  async function handleDownload(fileName: string) {
    downloading = true;
    
    try {
      const file = await downloadFile(fileName);
      imageUrl = URL.createObjectURL(file);
    } catch (error) {
      alert('Download failed: ' + error);
    } finally {
      downloading = false;
    }
  }
</script>

<!-- File upload -->
<input type="file" bind:files accept="image/*" />
<button on:click={handleUpload} disabled={!files}>Upload</button>

<!-- Progress bar -->
{#if uploadProgress > 0 && uploadProgress < 100}
  <div class="progress-bar">
    <div class="progress-fill" style="width: {uploadProgress}%"></div>
    <span>{uploadProgress}%</span>
  </div>
{/if}

<!-- Downloaded image display -->
{#if imageUrl}
  <img src={imageUrl} alt="Downloaded file" />
{/if}

<!-- Download button -->
<button on:click={() => handleDownload('my-file.jpg')} disabled={downloading}>
  {downloading ? 'Downloading...' : 'Download File'}
</button>
`;
