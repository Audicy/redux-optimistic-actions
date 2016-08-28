import isActionOptimistic from './isActionOptimistic';

function canActionBeReverted(action) {
  return isActionOptimistic(action) &&
    action.meta.status === 'pending';
}

function initializeState(state) {
  if (typeof state !== 'object') {
    throw new Error('State must be an object');
  }
  return {
    optimist: {
      history: [],
      historyBaseState: { ...state },
    },
    ...state
  };
}

function establishHistoryBaseState(state, reduce) {
  const {
      optimist: {
          history,
          historyBaseState
      },
      ...innerState
  } = state;

  // Establish new preHistory baseline by
  // playing through actions that cannot be
  // reverted.
  let newHistoryBaseState = { ...historyBaseState };
  const newHistory = [];
  let encounteredRevertableAction = false;
  history.forEach((historicalAction) => {
    if (!encounteredRevertableAction &&
      !canActionBeReverted(historicalAction)) {
      newHistoryBaseState = reduce(newHistoryBaseState, historicalAction);
    } else {
      encounteredRevertableAction = true;
      newHistory.push(historicalAction);
    }
  });

  return {
    optimist: {
      history: newHistory,
      historyBaseState: newHistoryBaseState
    },
    ...innerState
  };
}

function processNonOptimisticAction(state, action, reduce) {
  const {
      optimist: {
          history,
          historyBaseState
      },
      ...innerState
  } = state;

  const newInnerState = reduce(innerState, action);
  let baseState = historyBaseState;
  const newHistory = [...history];
  if (newHistory.length > 0) {
    newHistory.push(action);
  } else {
    baseState = newInnerState;
  }



  return {
    optimist: {
      history: newHistory,
      historyBaseState: { ...baseState }
    },
    ...newInnerState
  };
}

function process(state, action, reduce) {
  const {
    optimist: {
      history,
      historyBaseState
    },
    ...innerState
  } = state;

  const newInnerState = reduce(innerState, action);
  const newHistory = [...history, action];

  return {
    optimist: {
      historyBaseState: { ...historyBaseState },
      history: newHistory
    },
    ...newInnerState
  };
}

function commit(state, action, reduce) {
  const currentTransactionID = action.meta.transactionID;
  const {
    optimist: {
      history,
      historyBaseState
    },
    ...innerState
  } = state;

  // If the current action is in the history, replace it with
  // the now successful action which cannot be reverted
  const newHistory = history.map((historicalAction) => {
    if (isActionOptimistic(historicalAction) &&
      historicalAction.meta.transactionID === currentTransactionID) {
      return action;
    }
    return historicalAction;
  });

  const newState = {
    optimist: {
      history: newHistory,
      historyBaseState: { ...historyBaseState }
    },
    ...innerState
  };

  // Establish new preHistory baseline
  return establishHistoryBaseState(newState, reduce);
}

function revert(state, action, reduce) {
  const currentTransactionID = action.meta.transactionID;
  const {
    optimist: {
      history,
      historyBaseState
    }
  } = state;

  // filter out the action that is being reverted from
  // the history
  const revertedHistory = history.filter((historicalAction) =>
    !isActionOptimistic(historicalAction) ||
    historicalAction.meta.transactionID !== currentTransactionID
  );

  // replay history to regenerate state as if the reverted action
  // didn't happen
  let newInnerState = { ...historyBaseState };
  revertedHistory.forEach((historicalAction) => {
    newInnerState = reduce(newInnerState, historicalAction);
  });

  const newState = {
    optimist: {
      history: revertedHistory,
      historyBaseState: { ...historyBaseState }
    },
    ...newInnerState
  };

  return establishHistoryBaseState(newState, reduce);
}

export default (reduce) => (inState, action) => {
  if (!inState) {
    return reduce(inState, action);
  }

  // First time through, add optimistic
  // state properties
  let state = inState;
  if (!state.optimist) {
    state = initializeState(inState);
  }

  if (isActionOptimistic(action)) {
    switch (action.meta.status) {
      case 'success':
        return commit(state, action, reduce);
      case 'pending':
        return process(state, action, reduce);
      case 'error':
        return revert(state, action, reduce);
      default:
        return state;
    }
  }

  return processNonOptimisticAction(state, action, reduce);
};
