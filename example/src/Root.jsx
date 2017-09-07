import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import RemindersContainer from './view/RemindersContainer';
import remindersReducer from './reminders/reducer';
import remindersSaga from './reminders/saga';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(remindersReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(remindersSaga);

const Root = (<Provider store={store}>
  <RemindersContainer />
</Provider>);

export default Root;
