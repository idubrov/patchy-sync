import { connect } from 'react-redux';
import Reminders from './Reminders';
import { patchDocument } from '../../../src/actions';

const mapStateToProps = state => ({
  document: state.patchy.reminders.local,
  pending: state.patchy.reminders.pending.length > 0
});

const mapDispatchToProps = {
  patchDocument: patch => patchDocument('reminders', patch)
};

export default connect(mapStateToProps, mapDispatchToProps)(Reminders);
