/* eslint-disable no-plusplus */
export const MOUNT_DOCUMENT = '@patchy/MOUNT';
export const MOUNT_DOCUMENT_COMPLETE = '@patchy/MOUNT_COMPLETE';
export const UNMOUNT_DOCUMENT = '@patchy/UNMOUNT';
export const PATCH_DOCUMENT = '@patchy/PATCH';
export const PATCH_DOCUMENT_COMPLETE = '@patchy/PATCH_COMPLETE';

let nextTransactionId = 1;

// Used in tests to reset transaction id counter
export function _resetTxid(txid) { // eslint-disable-line no-underscore-dangle
  nextTransactionId = txid;
}

export const mountDocument = (key, url) => ({
  type: MOUNT_DOCUMENT,
  payload: {
    key,
    url,
    txid: nextTransactionId++
  }
});

export const mountDocumentComplete = (key, txid, revision, document) => ({
  type: MOUNT_DOCUMENT_COMPLETE,
  payload: {
    key,
    revision,
    document,
    txid
  }
});

export const unmountDocument = key => ({
  type: UNMOUNT_DOCUMENT,
  payload: {
    key,
    txid: nextTransactionId++
  }
});

export const patchDocument = (key, patch) => ({
  type: PATCH_DOCUMENT,
  payload: {
    key,
    txid: nextTransactionId++,
    patch
  }
});

export const patchDocumentComplete = (key, txid, revision, data) => ({
  type: PATCH_DOCUMENT_COMPLETE,
  payload: {
    key,
    txid,
    revision,
    data
  }
});
