export const idlFactory = ({ IDL }) => {
  const GetUserDataError = IDL.Variant({
    'FailedToAddToList' : IDL.Null,
    'DidntFindUserData' : IDL.Null,
    'AnonymousCaller' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : GetUserDataError });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : GetUserDataError });
  return IDL.Service({
    'add_to_list' : IDL.Func([IDL.Principal], [], []),
    'get_principal_data' : IDL.Func([], [Result], ['query']),
    'set_principal_data' : IDL.Func([IDL.Text], [Result_1], []),
    'test_func' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
