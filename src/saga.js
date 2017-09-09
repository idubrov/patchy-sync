import { call, put, take, select, actionChannel } from 'redux-saga/effects';
import { buffers } from 'redux-saga';
import fetch from 'isomorphic-fetch';
import appendQuery from 'append-query';
import {
  MOUNT_DOCUMENT, mountDocumentComplete, PATCH_DOCUMENT, patchDocumentComplete,
  patchDocumentFailed
} from './actions';

// TODO: custom headers, credentials?
function processResponse(response) {
  const contentType = response.headers.get('Content-Type');
  const responseData = contentType && contentType.indexOf('application/json') !== -1
    ? response.json()
    : response.text();
  const revisionStr = response.headers.get('X-Revision');
  const revision = revisionStr !== null
    ? parseInt(revisionStr, 10)
    : undefined;
  if (revision === undefined) {
    console.warn('Cannot get X-Revision header from the response. ' +
      'Check that CORS is properly configured on the server');
  }
  if (response.ok) {
    return responseData.then(data => ({ data, revision }));
  }
  return responseData.then((data) => {
    const error = new Error(response.statusText);
    error.data = data;
    error.revision = revision;
    throw error;
  });
}

function mountRequest(action, state) {
  return fetch(state.url).then(processResponse);
}

function patchRequest(action, state) {
  // Specify which "remote" revision we have so far, so server knows how many patches to return
  const url = appendQuery(state.url, { revision: state.remoteRevision }, { removeNull: true });
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    method: 'PATCH',
    body: JSON.stringify(action.payload.patch)
  }).then(processResponse);
}

export default function* patchySaga(selector) {
  const stateSelector = typeof selector === 'function'
    ? selector
    : state => state[selector];
  const actionPattern = action =>
    (action.type === MOUNT_DOCUMENT || action.type === PATCH_DOCUMENT);

  // We want to process actions sequentially
  // TODO: should we run separate documents via separate channels?
  const chan = yield actionChannel(actionPattern, buffers.expanding());
  while (true) {
    const action = yield take(chan);
    const { key, txid } = action.payload;

    const patchyState = yield select(state => stateSelector(state)[key]);
    try {
      const requestHandler = action.type === PATCH_DOCUMENT
        ? patchRequest
        : mountRequest;
      const responseHandler = action.type === PATCH_DOCUMENT
        ? patchDocumentComplete
        : mountDocumentComplete;
      const { data, revision } = yield call(requestHandler, action, patchyState);
      const completeAction = responseHandler(key, txid, revision, data);
      yield put(completeAction);
    } catch (err) {
      if (action.type === PATCH_DOCUMENT &&
          typeof err.data !== 'undefined' &&
          typeof err.revision !== 'undefined') {
        yield put(patchDocumentFailed(key, txid,
          err.revision, err.data, err.message || err));
      } else {
        console.error('Unexpected error', err);
        // FIXME: handle errors for mount?...
      }
    }
  }
}
