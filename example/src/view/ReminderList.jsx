import React from 'react';
import PropTypes from 'prop-types';
import { RIEInput } from 'riek';
import ValueEdit from './ValueEdit';
import Context from './Context';
import ReminderItem from './ReminderItem';
import DeleteItem from './DeleteFromList';

const ReminderList = ({ context }) => (<li>
  <section className="items">
    <h2>
      <ValueEdit context={context.into('title')} /><DeleteItem context={context} />
    </h2>
    <ul>
      {context.value.items.$order.map(itemId =>
        (<ReminderItem
          key={itemId}
          context={context.into('items', itemId)}
        />)
      )}
      <li>
        <RIEInput
          editing
          value=""
          propName="value"
          change={({ value }) => console.log(`Adding new item ${value}`)}
        />
      </li>
    </ul>
  </section>
</li>);

ReminderList.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default ReminderList;
