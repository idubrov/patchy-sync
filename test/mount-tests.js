import reducer from '../src/reducer';
import {
  mountDocument, mountDocumentComplete, unmountDocument, patchDocumentComplete,
  _resetTxid
} from '../src/actions';

describe('patchy-sync reducer tests', () => {
  beforeEach(() => {
    _resetTxid(100); // So we get stable test results in individual/collective test runs
  });

  it('should record pending load action', () => {
    const action = mountDocument('somekey', 'http://example.com/1');
    const state = reducer(undefined, action);
    state.should.deep.equals({
      somekey: {
        pending: [],
        mounting: action.payload.txid,
        url: 'http://example.com/1'
      }
    });
  });

  it('should only record last load action', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const secondAction = mountDocument('somekey', 'http://example.com/2');
    const state = [firstAction, secondAction].reduce(reducer, undefined);
    state.should.deep.equals({
      somekey: {
        pending: [],
        mounting: secondAction.payload.txid,
        url: 'http://example.com/2'
      }
    });
  });

  it('should only respect latest mount', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const secondAction = mountDocument('somekey', 'http://example.com/2');
    const actions = [
      firstAction,
      secondAction,
      mountDocumentComplete('somekey', secondAction.payload.txid, 2, { title: 'Second document' }),
      mountDocumentComplete('somekey', firstAction.payload.txid, 1, { title: 'First document' })
    ];

    const state = actions.reduce(reducer, undefined);
    state.should.deep.equal({
      somekey: {
        pending: [],
        local: { title: 'Second document' },
        remote: { title: 'Second document' },
        remoteRevision: 2,
        url: 'http://example.com/2'
      }
    });
  });

  it('unmount removes document', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const state = [
      firstAction,
      unmountDocument('somekey')
    ].reduce(reducer, undefined);
    state.should.deep.equals({ });
  });

  it('last unmount wins', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const state = [
      firstAction,
      unmountDocument('somekey'),
      mountDocumentComplete('somekey', firstAction.payload.txid, 1, { title: 'First document' })
    ].reduce(reducer, undefined);
    state.should.deep.equals({ });
  });

  it('patch complete should be ignored after mount', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const secondAction = patchDocumentComplete('somekey', 99, 14, {
      patches: [
        [{ op: 'add', path: '/title', value: 'hello' }]
      ]
    });
    const state = [firstAction, secondAction].reduce(reducer, undefined);
    state.should.deep.equals({
      somekey: {
        pending: [],
        mounting: firstAction.payload.txid,
        url: 'http://example.com/1'
      }
    });
  });

  it('mount document complete should be ignored after mount', () => {
    const firstAction = mountDocument('somekey', 'http://example.com/1');
    const secondAction = mountDocumentComplete('somekey', 99, 2, { title: 'Second document' });
    const state = [firstAction, secondAction].reduce(reducer, undefined);
    state.should.deep.equals({
      somekey: {
        pending: [],
        mounting: firstAction.payload.txid,
        url: 'http://example.com/1'
      }
    });
  });
});
