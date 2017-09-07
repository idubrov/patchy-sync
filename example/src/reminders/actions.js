export const PATCH_DOCUMENT = 'reminders@PATCH_DOCUMENT';
export const patchDocument = patch => ({
  type: PATCH_DOCUMENT,
  payload: patch
});
