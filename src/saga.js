import { call, put, take, select, actionChannel, fork, cancel } from 'redux-saga/effects';
import { buffers } from 'redux-saga';
import simpleClient from './simpleClient';
import {
  MOUNT_DOCUMENT, mountDocumentComplete, PATCH_DOCUMENT, patchDocumentComplete,
  patchDocumentFailed, UNMOUNT_DOCUMENT
} from './actions';


function* loadDocument(stateSelector, client, mountAction) {
  const { key, txid } = mountAction.payload;

  // First, load the document
  const get = client.get.bind(client);
  const patchyState = yield select(state => stateSelector(state)[key]);
  const { data, revision } = yield call(get, mountAction, patchyState);
  // FIXME: errors for mounts?
  yield put(mountDocumentComplete(key, txid, revision, data));
}

function* documentSaga(stateSelector, client, mountAction) {
  yield loadDocument(stateSelector, client, mountAction);

  const patch = client.patch.bind(client);
  const key = mountAction.payload.key;
  const actionPattern = action => action.type === PATCH_DOCUMENT && action.payload.key === key;

  // We want to process patch actions sequentially, so buffer them
  const chan = yield actionChannel(actionPattern, buffers.expanding());
  while (true) {
    const action = yield take(chan);
    const { txid } = action.payload;

    const patchyState = yield select(state => stateSelector(state)[key]);
    try {
      const { data, revision } = yield call(patch, action, patchyState);
      yield put(patchDocumentComplete(key, txid, revision, data));
    } catch (err) {
      if (typeof err.data !== 'undefined' &&
          typeof err.revision !== 'undefined') {
        yield put(patchDocumentFailed(key, txid,
          err.revision, err.data, err.message || err));
      } else {
        console.error('Unexpected error', err);
      }
    }
  }
}

export default function* patchySaga(selector, client = simpleClient) {
  const stateSelector = typeof selector === 'function'
    ? selector
    : state => state[selector];

  const sagas = new Map();
  while (true) {
    const action = yield take(MOUNT_DOCUMENT, UNMOUNT_DOCUMENT);
    const { key } = action.payload;
    if (sagas.has(key)) {
      // Terminate old worker. We don't need to care (much) for race conditions -- all events
      // emitted by cancelled worker will be discarded by reducer (as state is immediately
      // reset on MOUNT_DOCUMENT).
      // However, we should never initiate two PATCH requests on the same action, which
      // should be ensured by 'cancel'.
      yield cancel(sagas.get(key));
      sagas.delete(key);
    }

    if (action.type === MOUNT_DOCUMENT) {
      const worker = yield fork(documentSaga, stateSelector, client, action);
      sagas.set(key, worker);
    }
  }
}
