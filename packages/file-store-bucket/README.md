# File Store Bucket

A persistent Motoko canister for storing files in chunks. This package provides a robust file storage solution that allows users to upload files in batches, where each file is split into multiple chunks for efficient handling.

## Features

- **Chunked File Upload**: Files are split into chunks for efficient upload and storage
- **Batch Management**: Upload sessions are managed through batches with automatic expiration
- **User Registration**: Secure user registration system with backend integration
- **File Retrieval**: Admin functions for retrieving stored files and chunks
- **SHA256 Validation**: Built-in file integrity checking using SHA256 hashes
- **Persistent Storage**: State is preserved across canister upgrades

## Usage

### Installation

Add this package to your `mops.toml`:

```toml
[dependencies]
file-store-bucket = "0.1.0"
```

### Basic Usage

```motoko
import FileStoreBucket "mo:file-store-bucket";

// The canister provides these main functions:
// - register_user_by_backend(user: Principal): async ()
// - is_user_registered(): async Bool
// - create_batch(args: BatchArg): async BatchId
// - upload_chunk({batchId, chunk}: UploadChunkArg): async ()
// - get_stored_files(): async [(Text, File)]
// - get(file_name: FileName): async FileData
// - get_chunk({file_name, index}): async {content: Blob}
// - list(): async [FileInfo]
```

## Documentation

📚 **Complete API Documentation**: [View Generated Docs](./docs/index.html)

The generated documentation includes detailed information about all types, functions, and usage examples.

### Quick Links
- [Main Module](./docs/main.html) - Core file storage functionality
- [Batch Management](./docs/Batch.html) - Upload batch operations
- [Utilities](./docs/Utils.html) - Helper functions

## API Reference

### Types

```motoko
type BatchArg = {
  chunksSha256 : [Blob];
  name : Text;
  contentType : Text;
  sha256 : ?Blob;
};

type UploadChunkArg = {
  batchId : Nat;
  chunk : Blob;
};

type FileInfo = {
  file_name : Text;
  modified : Nat64;
  content_type : Text;
  sha256 : ?Blob;
  size : Nat;
  nos_chunks : Nat;
};
```

### Functions

#### User Management
- `register_user_by_backend(user: Principal)`: Register a user (backend only)
- `is_user_registered()`: Check if caller is registered

#### File Upload
- `create_batch(args: BatchArg)`: Create a new upload batch
- `upload_chunk({batchId, chunk}: UploadChunkArg)`: Upload a file chunk

#### File Retrieval (Admin Only)
- `get_stored_files()`: Get all stored files
- `get(file_name: Text)`: Get file metadata and first chunk
- `get_chunk({file_name, index})`: Get specific chunk by index
- `list()`: List all files with metadata

## Security

- Only registered users can upload files
- Batch uploads expire after 5 minutes of inactivity
- File integrity is validated using SHA256 hashes
- Admin-only access to file retrieval functions

## License

This project is licensed under the MIT License.
