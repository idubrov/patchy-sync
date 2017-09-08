import jsonpatch from 'jsonpatch';
import { SAMPLE } from './saga';
import { PATCH_DOCUMENT } from './actions';

export default function (state = SAMPLE, action) {
  if (action.type === PATCH_DOCUMENT) {
    console.log(action);
    return jsonpatch.apply_patch(state, action.payload);
  }
  return state;
}
