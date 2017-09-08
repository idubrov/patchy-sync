import { connect } from 'react-redux';
import App from './App';

const mapStateToProps = state => ({
  loading: !state.patchy || !state.patchy.reminders || !state.patchy.reminders.local
});

export default connect(mapStateToProps)(App);
