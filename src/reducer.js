import jsonpatch from 'jsonpatch';
import { MOUNT_DOCUMENT, MOUNT_DOCUMENT_COMPLETE, UNMOUNT_DOCUMENT, PATCH_DOCUMENT, PATCH_DOCUMENT_COMPLETE } from './actions';

function handleMount(state, action) {
  const { url, txid } = action.payload;
  return ({
    mounting: txid,
    url
  });
}

function handleMountComplete(state, action) {
  const { revision, document, txid } = action.payload;
  if (state.mounting !== txid) {
    // Mount action was cancelled already or was unmounted
    return state;
  }
  return ({
    pending: [],
    local: document,
    remote: document,
    remoteRevision: revision,
    localRevision: revision,
    url: state.url
  });
}

function handleUnmount() {
  return undefined;
}

function maybePatch(state, patch) {
  try {
    return jsonpatch.apply_patch(state, patch);
  } catch (err) {
    console.warn(err);
    return state;
  }
}

function handlePatch(state, action) {
  // Do optimistic update
  const local = maybePatch(state.local, action.payload.patch);

  // Record action in pending list, so we can replay it in case we need to resync
  const pending = state.pending.concat(action);
  const localRevision = state.localRevision + 1;
  return Object.assign({}, state, { local, pending, localRevision });
}

function handlePatchComplete(state, action) {

}

const HANDLERS = Object.freeze({
  [MOUNT_DOCUMENT]: handleMount,
  [MOUNT_DOCUMENT_COMPLETE]: handleMountComplete,
  [UNMOUNT_DOCUMENT]: handleUnmount,
  [PATCH_DOCUMENT]: handlePatch,
  [PATCH_DOCUMENT_COMPLETE]: handlePatchComplete
});

export default function patchyReducer(state = {}, action) {
  const handler = HANDLERS[action.type];
  if (!handler) {
    return state;
  }

  const { key } = action.payload;

  // Only mounting should work if state is not present
  if (!state[key] && action.type !== MOUNT_DOCUMENT) {
    return state;
  }

  const updated = handler(state[key], action);
  if (state[key] === updated) {
    return state;
  }
  const copy = Object.assign({}, state);
  if (updated === undefined) {
    delete copy[key];
  } else {
    copy[key] = updated;
  }
  return copy;
}
