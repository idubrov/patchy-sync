import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import App from './view/AppContainer';
import remindersReducer from './reminders/reducer';
import { patchySaga, patchyReducer } from '../../src/index';
import remindersSaga from './reminders/saga';

const reducer = combineReducers({
  reminders: remindersReducer,
  patchy: patchyReducer
});
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, composeWithDevTools(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(remindersSaga);
sagaMiddleware.run(patchySaga);

const Root = (<Provider store={store}>
  <App />
</Provider>);

export default Root;
