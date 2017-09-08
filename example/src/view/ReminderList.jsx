import React from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';
import ValueEdit from './ValueEdit';
import Context from './Context';
import ReminderItem from './ReminderItem';
import DeleteFromListButton from './DeleteFromListButton';
import NewItemControl from './NewItemControl';

class ReminderList extends React.PureComponent {
  static propTypes = {
    context: PropTypes.instanceOf(Context).isRequired
  };

  handleNewItem = (value) => {
    const id = uuid.v4();
    this.props.context.patch([
      { op: 'add', path: `/items/${id}`, value: { text: value } },
      { op: 'add', path: '/items/$order/-', value: id }
    ]);
  };

  render = () => {
    const context = this.props.context;
    return (<li>
      <section className="items">
        <h2>
          <ValueEdit context={context.into('title')} /><DeleteFromListButton context={context} />
        </h2>
        <ul>
          {context.value.items.$order.map(itemId =>
            (<ReminderItem
              key={itemId}
              context={context.into('items', itemId)}
            />)
          )}
          <NewItemControl onCreate={this.handleNewItem} tagName="li" />
        </ul>
      </section>
    </li>);
  }
}

export default ReminderList;
