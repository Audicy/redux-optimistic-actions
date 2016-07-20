export default (type, actionCreator) => (args) =>
  ({
    type,
    payload: args,
    meta: {
      optimistic: true,
      promise: actionCreator(args)
    }
  });
