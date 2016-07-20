import isActionOptimistic from './isActionOptimistic';

let transactionID = 0;

export default function optimisticActionMiddleware({ dispatch }) {
  return next => action => {
    if (!isActionOptimistic(action)) {
      next(action);
      return;
    }

    if (action.meta.transactionID === undefined) {
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
        () => dispatch({
          type: action.type,
          payload: action.payload,
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
    } else {
      next(action);
    }
  };
}
