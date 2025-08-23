import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BatchArg {
  'sha256' : [] | [Uint8Array | number[]],
  'contentType' : string,
  'chunksSha256' : Array<Uint8Array | number[]>,
  'name' : string,
}
export type BatchId = bigint;
export interface File {
  'modified' : bigint,
  'content' : Array<Uint8Array | number[]>,
  'sha256' : [] | [Uint8Array | number[]],
  'contentType' : string,
}
export interface FileInfo {
  'modified' : bigint,
  'sha256' : [] | [Uint8Array | number[]],
  'size' : bigint,
  'content_type' : string,
  'file_name' : FileName,
  'nos_chunks' : bigint,
}
export type FileName = string;
export interface UploadChunkArg {
  'chunk' : Uint8Array | number[],
  'batchId' : bigint,
}
export interface _SERVICE {
  'create_batch' : ActorMethod<[BatchArg], BatchId>,
  'get' : ActorMethod<
    [{ 'file_name' : FileName }],
    {
      'modified' : bigint,
      'content' : Uint8Array | number[],
      'sha256' : [] | [Uint8Array | number[]],
      'chunks_left' : bigint,
      'content_type' : string,
    }
  >,
  'get_chunk' : ActorMethod<
    [{ 'file_name' : FileName, 'index' : bigint }],
    { 'content' : Uint8Array | number[] }
  >,
  'get_stored_files' : ActorMethod<[], Array<[string, File]>>,
  'is_user_registered' : ActorMethod<[], boolean>,
  'list' : ActorMethod<[], Array<FileInfo>>,
  'register_user_by_backend' : ActorMethod<[Principal], undefined>,
  'upload_chunk' : ActorMethod<[UploadChunkArg], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
