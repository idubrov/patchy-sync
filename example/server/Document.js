import uuid from 'uuid';
import jsonpatch from 'jsonpatch';

export default class Document {
  constructor(doc) {
    this.current = doc;
    this.patches = [];
    this.uuid = uuid.v4();
    this.lastModifiedDate = new Date();
  }

  get revision() {
    return this.patches.length;
  }

  get etag() {
    return `W/"${this.uuid}-${this.revision}"`;
  }

  get lastModified() {
    return this.lastModifiedDate.toUTCString();
  }

  patch(patch, patchAgainst = this.revision) {
    if (patchAgainst > this.revision) {
      throw new Error('Invalid revision to patch against (newer than the current document)!');
    }

    let errorCode;
    let errorMessage;
    try {
      this.current = jsonpatch.apply_patch(this.current, patch);
      this.lastModifiedDate = new Date();
      this.patches.push(patch);
    } catch (err) {
      errorMessage = err.message;
      errorCode = 'conflict';
    }

    return {
      patches: this.patches.slice(patchAgainst),
      errorCode,
      errorMessage
    };
  }
}
