import reducer from '../src/reducer';
import {
  mountDocument, mountDocumentComplete, patchDocument, patchDocumentFailed,
  _resetTxid
} from '../src/actions';

describe('patchy-sync reducer tests (conflicts)', () => {
  const mountAction = mountDocument('somekey', 'http://example.com/1');
  const mountCompleteAction = mountDocumentComplete('somekey', mountAction.payload.txid, 13, { title: 'hello' });
  const initialState = [mountAction, mountCompleteAction].reduce(reducer, undefined);

  beforeEach(() => {
    _resetTxid(100); // So we get stable test results in individual/collective test runs
  });

  it('optimistic update is reverted (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' },
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 13, [], new Error('conflict'));
    const state = [patchAction, patchFailedAction].reduce(reducer, initialState);
    state.should.deep.equals(initialState);
  });

  it('remaining patches are replayed (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const secondPatchAction = patchDocument('somekey', [
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 13, [], new Error('conflict'));
    const state = [patchAction, secondPatchAction, patchFailedAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [secondPatchAction],
        local: { title: 'hello', text: 'Good bye!' },
        remote: { title: 'hello' },
        remoteRevision: 13,
        url: 'http://example.com/1'
      }
    });
  });

  it('missing patches are applied (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 14, {
      patches: [
        [{ op: 'add', path: '/title', value: 'hi' }]
      ]
    }, new Error('conflict'));
    const state = [patchAction, patchFailedAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'hi' },
        remote: { title: 'hi' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('extra patches are ignored (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 14, {
      patches: [
        [{ op: 'add', path: '/extra/title', value: 'secret' }], // Revision 12, should not be applied
        [{ op: 'remove', path: '/extra' }], // Revision 13, should not be applied as we have revision 13
        [{ op: 'add', path: '/title', value: 'hi' }] // Revision 14
      ]
    }, new Error('conflict'));
    const state = [patchAction, patchFailedAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'hi' },
        remote: { title: 'hi' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('should not apply patches which client has already (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 13, {
      patches: [
        [{ op: 'test', path: '/title', value: 'howdy?' },
          { op: 'add', path: '/title', value: 'hello' }
        ]
      ]
    }, new Error('conflict'));
    const state = [patchAction, patchFailedAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'hello' },
        remote: { title: 'hello' },
        remoteRevision: 13,
        url: 'http://example.com/1'
      }
    });
  });

  it('not enough patches (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchFailedAction = patchDocumentFailed('somekey', patchAction.payload.txid, 15, {
      patches: [
        [{ op: 'add', path: '/title', value: 'good morning!' }]
      ]
    }, new Error('conflict'));
    expect(() => [patchAction, patchFailedAction].reduce(reducer, initialState)).to
      .throw('assertion failed: too few patches received from the server!');
  });
});
