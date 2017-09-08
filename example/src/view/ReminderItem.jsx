import React from 'react';
import PropTypes from 'prop-types';
import ValueEdit from './ValueEdit';
import Context from './Context';
import DeleteItem from './DeleteFromListButton';

const ReminderItem = ({ context }) => (<li>
  <ValueEdit context={context.into('text')} /><DeleteItem context={context} />
</li>);

ReminderItem.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default ReminderItem;
