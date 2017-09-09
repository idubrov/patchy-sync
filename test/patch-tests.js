import reducer from '../src/reducer';
import {
  mountDocument, mountDocumentComplete, unmountDocument, patchDocument, patchDocumentComplete,
  _resetTxid
} from '../src/actions';

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
      { op: 'add', path: '/title', value: 'hi' },
      { op: 'add', path: '/text', value: 'Hello again!' }
    ]);
    const state = [patchAction, secondPatchAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [patchAction, secondPatchAction],
        local: { title: 'hi', text: 'Hello again!' },
        remote: { title: 'hello' },
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

  it('optimistic update is applied', () => {
    const patch = [
      { op: 'add', path: '/title', value: 'bye' },
      { op: 'add', path: '/text', value: 'Good bye!' }
    ];
    const patchAction = patchDocument('somekey', patch);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 14, { patches: [patch] });
    const state = [patchAction, patchCompleteAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'bye', text: 'Good bye!' },
        remote: { title: 'bye', text: 'Good bye!' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('remaining patches are replayed', () => {
    const firstPatch = [{ op: 'add', path: '/title', value: 'bye' }];
    const patchAction = patchDocument('somekey', firstPatch);
    const secondPatchAction = patchDocument('somekey', [
      { op: 'add', path: '/text', value: 'Good bye!' }
    ]);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 14,
      { patches: [firstPatch] });
    const state = [patchAction, secondPatchAction, patchCompleteAction]
      .reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [secondPatchAction],
        local: { title: 'bye', text: 'Good bye!' },
        remote: { title: 'bye' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('missing patches are applied', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 15, {
      patches: [
        [{ op: 'add', path: '/text', value: 'Hello!' }],
        [{ op: 'add', path: '/title', value: 'bye' }]
      ]
    });
    const state = [patchAction, patchCompleteAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'bye', text: 'Hello!' },
        remote: { title: 'bye', text: 'Hello!' },
        remoteRevision: 15,
        url: 'http://example.com/1'
      }
    });
  });

  it('extra patches are ignored', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 14, {
      patches: [
        [{ op: 'add', path: '/extra/title', value: 'secret' }], // Revision 12, should not be applied
        [{ op: 'remove', path: '/extra' }], // Revision 13, should not be applied as we have revision 13
        [{ op: 'add', path: '/title', value: 'bye' }] // Revision 14
      ]
    });
    const state = [patchAction, patchCompleteAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'bye' },
        remote: { title: 'bye' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('should not apply patches which client has already', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 14, {
      patches: [
        [{ op: 'test', path: '/title', value: 'howdy?' },
          { op: 'add', path: '/title', value: 'hello' }
        ],
        [{ op: 'add', path: '/title', value: 'bye' }]
      ]
    });
    const state = [patchAction, patchCompleteAction].reduce(reducer, initialState);
    state.should.deep.equals({
      somekey: {
        pending: [],
        local: { title: 'bye' },
        remote: { title: 'bye' },
        remoteRevision: 14,
        url: 'http://example.com/1'
      }
    });
  });

  it('not enough patches (conflict)', () => {
    const patchAction = patchDocument('somekey', [
      { op: 'add', path: '/title', value: 'bye' }
    ]);
    const patchCompleteAction = patchDocumentComplete('somekey', patchAction.payload.txid, 15, {
      patches: [
        [{ op: 'add', path: '/title', value: 'bye' }]
      ]
    });
    expect(() => [patchAction, patchCompleteAction].reduce(reducer, initialState)).to
      .throw('assertion failed: too few patches received from the server!');
  });
});
