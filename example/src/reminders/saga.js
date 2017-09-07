import { call, put } from 'redux-saga/effects';
import { mountDocument } from '../../../src/index';
import { createIfMissing, documentUrl } from './api';

export const SAMPLE = {
  lists: {
    $order: [
      '867a0b5f-7140-4520-94d1-60b044ad0b91',
      '5936e65c-ebd5-4060-9668-1cc368e1e084'
    ],
    '867a0b5f-7140-4520-94d1-60b044ad0b91': {
      title: 'Groceries',
      items: {
        $order: ['a71d8b7c-f5a1-46d9-b2b9-b741c676268b',
          '7ae586e8-783b-47fe-b945-3ee02ba8ff89',
          '6c26ee94-17f3-4def-9366-4a25a56bb50e'
        ],
        'a71d8b7c-f5a1-46d9-b2b9-b741c676268b': {
          text: 'Milk'
        },
        '7ae586e8-783b-47fe-b945-3ee02ba8ff89': {
          text: 'Eggs'
        },
        '6c26ee94-17f3-4def-9366-4a25a56bb50e': {
          text: 'Broccoli'
        }
      }
    },
    '5936e65c-ebd5-4060-9668-1cc368e1e084': {
      title: 'Todo',
      items: {
        $order: ['15848b56-8890-4a54-b1ca-a9c403c4f3b3'],
        '15848b56-8890-4a54-b1ca-a9c403c4f3b3': {
          text: 'Paint trims'
        }
      }
    }
  }
};

export default function* applicationSaga() {
  yield call(createIfMissing, 'reminders', SAMPLE);
  yield put(mountDocument('reminders', documentUrl('reminders')));
}
