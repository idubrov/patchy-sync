import { MOUNT_DOCUMENT, MOUNT_DOCUMENT_COMPLETE } from './actions';

function handleMountDocument(state, action) {
  const { key, url, txid } = action.payload;
  return Object.assign({}, state, {
    [key]: {
      mounting: txid,
      url
    }
  });
}

function handleMountDocumentComplete(state, action) {
  const {
    key, revision, document, txid
  } = action.payload;
  if (!state[key] || state[key].mounting !== txid) {
    // Mount action was cancelled already/unmounted
    return state;
  }
  return Object.assign({}, state, {
    [key]: {
      pending: [],
      local: document,
      remote: document,
      remoteRevision: revision,
      localRevision: revision,
      url: state[key].url
    }
  });
}

const HANDLERS = Object.freeze({
  [MOUNT_DOCUMENT]: handleMountDocument,
  [MOUNT_DOCUMENT_COMPLETE]: handleMountDocumentComplete
});

export default function patchyReducer(state = {}, action) {
  const handler = HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
