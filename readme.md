# Redux Optimistic Actions

## Installation

```bash
npm install --save redux-optimistic-actions
```

## Example Usage

```js
import { createOptimisticReducer } from 'redux-optimistic-actions';

const initialState = { sum: 0 };

const reducer = createOptimisticReducer((state = initialState, action) => {
    switch (action.type) {
        case 'ADD':
            return { sum: state.sum + action.payload };
        case 'SUBTRACT':
            return { sum: state.sum - action.payload };
        default:
            return state;
    }
});

window.reducer = reducer;

window.action1 = {
    type: 'ADD',
    payload: 1,
    meta: {
        transactionID: 0,
        status: 'pending',
        optimistic: true
    }
};

window.action2 = {
    type: 'ADD',
    payload: 2,
    meta: {
        transactionID: 1,
        status: 'pending',
        optimistic: true
    }
};

window.action3 = {
    type: 'ADD',
    payload: 3
};

window.action2revert = {
    type: 'ADD',
    payload: new Error('bad bad'),
    meta: {
        transactionID: 1,
        status: 'failure',
        optimistic: true
    }
};

window.action1commit = {
    type: 'ADD',
    payload: 1,
    meta: {
        transactionID: 0,
        status: 'success',
        optimistic: true
    }
};
```
