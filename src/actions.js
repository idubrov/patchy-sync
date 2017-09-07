export const MOUNT_DOCUMENT = '@patchy/MOUNT';
export const UNMOUNT_DOCUMENT = '@patchy/UNMOUNT';

export const mountDocument = (key, url) => ({
  type: MOUNT_DOCUMENT,
  payload: {
    key,
    url,
  },
});

export const unmountDocument = key => ({
  type: UNMOUNT_DOCUMENT,
  payload: {
    key,
  },
});
