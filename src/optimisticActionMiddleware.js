import isActionOptimistic from 'isActionOptimistic';

let transactionID = 0;

export default function optimisticActionMiddleware({ dispatch }) {
  return next => action => {
    if (!isActionOptimistic(action)) {
      next(action);
      return;
    }

    const thisTransaction = transactionID;

    // Dispatch the pending action
    dispatch({
      type: action.type,
      payload: action.payload,
      meta: {
        ...action.meta,
        transactionID: thisTransaction,
        status: 'pending'
      }
    });

    // Dispatch success or failure when promise
    // is resolved
    action.meta.promise.then(
      (result) => dispatch({
        type: action.type,
        payload: result,
        meta: {
          ...action.meta,
          transactionID: thisTransaction,
          status: 'success'
        }
      }),
      (error) => {
        dispatch({
          type: action.type,
          payload: error,
          error: true,
          meta: {
            ...action.meta,
            transactionID: thisTransaction,
            status: 'error'
          }
        });
        return Promise.reject(error);
      }
    );
    transactionID++;
  };
}