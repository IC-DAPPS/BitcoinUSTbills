# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-09-04

### Added
- Initial release of file-store-bucket package
- Chunked file upload functionality
- Batch management system with automatic expiration
- User registration system with backend integration
- File retrieval functions for admin users
- SHA256 file integrity validation
- Persistent storage across canister upgrades
- Comprehensive API for file storage operations

### Features
- Upload files in chunks for efficient handling
- Automatic batch cleanup after 5 minutes of inactivity
- Secure user authentication and authorization
- Admin-only file access controls
- File metadata management (name, type, size, modification time)
- Support for various file content types
