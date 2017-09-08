import React from 'react';
import PropTypes from 'prop-types';
import Reminders from './RemindersContainer';

const App = ({ loading }) => (loading ? <span>Loading</span> : <Reminders />);

App.propTypes = {
  loading: PropTypes.bool.isRequired
};

export default App;
