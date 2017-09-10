import jsonpatch from 'jsonpatch';
import {
  MOUNT_DOCUMENT, MOUNT_DOCUMENT_COMPLETE, UNMOUNT_DOCUMENT,
  PATCH_DOCUMENT, PATCH_DOCUMENT_COMPLETE, PATCH_DOCUMENT_FAILED
} from './actions';

function handleMount(state, action) {
  const { url, txid } = action.payload;
  return ({
    pending: [],
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
  return Object.assign({}, state, { local, pending });
}

function handlePatchFinalize(state, action) {
  const data = action.payload.data;
  const idx = state.pending.findIndex(a => a.payload.txid === action.payload.txid);
  if (idx === -1) {
    // Transaction is not in the pending list -- was cancelled (by mount), so ignore it
    return state;
  }

  let remote = state.remote;
  let remoteRevision = state.remoteRevision;

  if (data.patches) {
    // Apply missing patches from the server
    const patchesToApply = action.payload.revision - remoteRevision;
    if (patchesToApply > data.patches.length) {
      throw new Error('assertion failed: too few patches received from the server!');
    } else if (patchesToApply > 0) {
      const patches = data.patches.slice(-patchesToApply); // Take patchesToApply patches
      remote = patches.reduce((s, p) => jsonpatch.apply_patch(s, p), remote);
      remoteRevision = action.payload.revision;
    }
  }

  // Remove action from the pending list
  let pending = state.pending;
  pending = pending.slice();
  pending.splice(idx, 1);

  // Replay pending patches
  const local = pending.reduce((s, a) => maybePatch(s, a.payload.patch), remote);

  return Object.assign({}, state, {
    local,
    remote,
    remoteRevision,
    pending
  });
}

const HANDLERS = Object.freeze({
  [MOUNT_DOCUMENT]: handleMount,
  [MOUNT_DOCUMENT_COMPLETE]: handleMountComplete,
  [UNMOUNT_DOCUMENT]: handleUnmount,
  [PATCH_DOCUMENT]: handlePatch,
  [PATCH_DOCUMENT_COMPLETE]: handlePatchFinalize,
  [PATCH_DOCUMENT_FAILED]: handlePatchFinalize
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
