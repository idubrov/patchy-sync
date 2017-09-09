import reducer from '../src/reducer';
import { mountDocument, mountDocumentComplete, patchDocument, _resetTxid, unmountDocument } from '../src/actions';

describe('patchy-sync reducer tests', () => {
  const mountAction = mountDocument('somekey', 'http://example.com/1');
  const mountCompleteAction = mountDocumentComplete('somekey', mountAction.payload.txid, 13, { title: 'hello' });
  const initialState = [mountAction, mountCompleteAction].reduce(reducer, undefined);

  beforeEach(() => {
    _resetTxid(100); // So we get stable test results in individual/collective test runs
  });

  it('optimistic update', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' },
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const state = [patchAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [patchAction],
        local: { title: 'bye', text: 'Good bye!' },
        remote: { title: 'hello' },
        localRevision: 14,
        remoteRevision: 13,
        url: 'http://example.com/1'
      }
    });
  });

  it('multiple optimistic updates', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' },
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const secondPatchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'hello' },
      { op: 'add', path: '/text', value: 'Hello again!' }
    ]);
    const state = [patchAction, secondPatchAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [patchAction, secondPatchAction],
        local: { title: 'hello', text: 'Hello again!' },
        remote: { title: 'hello' },
        localRevision: 15,
        remoteRevision: 13,
        url: 'http://example.com/1'
      }
    });
  });

  it('patch after unmount', () => {
    const unmountAction = unmountDocument('somekey');
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' },
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const state = [unmountAction, patchAction].reduce(reducer, initialState);
    state.should.deep.equals({ });
  });
});
