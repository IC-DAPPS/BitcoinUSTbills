export const idlFactory = ({ IDL }) => {
  const BatchArg = IDL.Record({
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'contentType' : IDL.Text,
    'chunksSha256' : IDL.Vec(IDL.Vec(IDL.Nat8)),
    'name' : IDL.Text,
  });
  const BatchId = IDL.Nat;
  const FileName = IDL.Text;
  const File = IDL.Record({
    'modified' : IDL.Nat64,
    'content' : IDL.Vec(IDL.Vec(IDL.Nat8)),
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'contentType' : IDL.Text,
  });
  const FileInfo = IDL.Record({
    'modified' : IDL.Nat64,
    'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'size' : IDL.Nat,
    'content_type' : IDL.Text,
    'file_name' : FileName,
    'nos_chunks' : IDL.Nat,
  });
  const UploadChunkArg = IDL.Record({
    'chunk' : IDL.Vec(IDL.Nat8),
    'batchId' : IDL.Nat,
  });
  return IDL.Service({
    'create_batch' : IDL.Func([BatchArg], [BatchId], []),
    'get' : IDL.Func(
        [IDL.Record({ 'file_name' : FileName })],
        [
          IDL.Record({
            'modified' : IDL.Nat64,
            'content' : IDL.Vec(IDL.Nat8),
            'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            'chunks_left' : IDL.Nat,
            'content_type' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'get_chunk' : IDL.Func(
        [IDL.Record({ 'file_name' : FileName, 'index' : IDL.Nat })],
        [IDL.Record({ 'content' : IDL.Vec(IDL.Nat8) })],
        ['query'],
      ),
    'get_stored_files' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, File))],
        ['query'],
      ),
    'is_user_registered' : IDL.Func([], [IDL.Bool], ['query']),
    'list' : IDL.Func([], [IDL.Vec(FileInfo)], ['query']),
    'register_user_by_backend' : IDL.Func([IDL.Principal], [], []),
    'upload_chunk' : IDL.Func([UploadChunkArg], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
