import React from 'react';
import PropTypes from 'prop-types';
import ValueEdit from './ValueEdit';
import Context from './Context';
import ReminderItem from './ReminderItem';
import DeleteItem from './DeleteFromList';

const ReminderList = ({ context }) => (<li>
  <section className="items">
    <h4>
      <ValueEdit context={context.into('title')} /><DeleteItem context={context} />
    </h4>
    <ul>
      {context.value.items.$order.map(itemId =>
        (<ReminderItem
          key={itemId}
          context={context.into('items', itemId)}
        />)
      )}
    </ul>
  </section>
</li>);

ReminderList.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default ReminderList;
