import jsonpointer from 'jsonpointer';


function mergePath(...paths) {
  const path = paths
    .filter(p => p !== undefined && p !== '')
    .map(p => p.replace(/^\/|\/$/g, '')).join('/');
  return path.length === 0 ? '' : `/${path}`;
}

export default class Context {
  constructor(document, patchDocument, path = '') {
    this.document = document;
    this.patchDocument = patchDocument;
    this.path = path;
  }

  get value() {
    return jsonpointer.get(this.document, this.path);
  }

  patch(patches) {
    this.patchDocument(patches.map(patch =>
      Object.assign({}, patch, { path: mergePath(this.path, patch.path) })));
  }

  into(...args) {
    return new Context(this.document, this.patchDocument, mergePath(this.path, ...args));
  }

  /**
   * Return the context of parent element.
   */
  up() {
    const pos = this.path.lastIndexOf('/');
    return new Context(this.document, this.patchDocument, pos === -1 ? '' : this.path.substring(0, pos));
  }

  /**
   * Return the last path element.
   */
  last() {
    const pos = this.path.lastIndexOf('/');
    return pos === -1 ? this.path : this.path.substring(pos + 1);
  }
}
