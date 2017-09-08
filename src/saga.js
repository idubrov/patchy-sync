import { call, put, take, actionChannel } from 'redux-saga/effects';
import { buffers } from 'redux-saga';
import fetch from 'isomorphic-fetch';
import { MOUNT_DOCUMENT, mountDocumentComplete } from './actions';

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

function mountRequest(action) {
  const { url } = action.payload;
  return fetch(url).then(processResponse);
}

export default function* patchySaga() {
  const actionPattern = action => action.type === MOUNT_DOCUMENT;
  // We want to process actions sequentially
  // TODO: should we run separate documents via separate channels?
  const chan = yield actionChannel(actionPattern, buffers.expanding());
  while (true) {
    const action = yield take(chan);
    const { key, txid } = action.payload;

    try {
      const { data, revision } = yield call(mountRequest, action);
      const mountComplete = mountDocumentComplete(key, txid, revision, data);
      yield put(mountComplete);
    } catch (err) {
      // FIXME: handle errors...
    }
  }
}
