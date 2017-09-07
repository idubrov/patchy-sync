import uuid from 'uuid';

export default class Document {
  constructor(doc) {
    this.current = doc;
    this.revisions = [];
    this.uuid = uuid.v4();
    this.lastModifiedDate = new Date();
  }

  get revision() {
    return this.revisions.length;
  }

  get etag() {
    return `W/"${this.uuid}-${this.revision}"`;
  }

  get lastModified() {
    return this.lastModifiedDate.toUTCString();
  }
}
