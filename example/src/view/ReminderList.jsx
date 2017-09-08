import React from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';
import ValueEdit from './ValueEdit';
import Context from './Context';
import ReminderItem from './ReminderItem';
import DeleteItem from './DeleteFromList';

class ReminderList extends React.PureComponent {
  static propTypes = {
    context: PropTypes.instanceOf(Context).isRequired
  };

  state = {
    newItem: ''
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const id = uuid.v4();
      this.props.context.patch([
        {
          op: 'add',
          path: `/items/${id}`,
          value: {
            text: e.target.value
          }
        },
        {
          op: 'add',
          path: '/items/$order/-',
          value: id
        }
      ]);
      this.setState({ newItem: '' });
    }
  };

  render = () => {
    const context = this.props.context;
    return (<li>
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
            <input
              className="new"
              value={this.state.newItem}
              onChange={e => this.setState({ newItem: e.target.value })}
              onKeyDown={this.handleKeyDown}
            />
          </li>
        </ul>
      </section>
    </li>);
  }
}

export default ReminderList;
