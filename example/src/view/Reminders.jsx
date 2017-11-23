import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import ReminderList from './ReminderList';
import Context from './Context';
import NewItemControl from './NewItemControl';

class RemindersList extends React.PureComponent {
  static propTypes = {
    document: PropTypes.shape({
      lists: PropTypes.shape({
        $order: PropTypes.arrayOf(PropTypes.string).isRequired
      }).isRequired
    }).isRequired,
    patchDocument: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired
  };

  handleNewList = (value) => {
    const id = uuid.v4();
    this.props.patchDocument([
      { op: 'add', path: `/lists/${id}`, value: { title: value, items: { $order: [] } } },
      { op: 'add', path: '/lists/$order/-', value: id }
    ]);
  };

  render = () => {
    const context = new Context(this.props.document, this.props.patchDocument);
    return (<div className="reminders">
      <section className="lists">
        <h1>Reminders{this.props.pending ? ' Saving...' : ''}</h1>
        <ul>
          {this.props.document.lists.$order.map(listId =>
            (<ReminderList
              key={listId}
              context={context.into('lists', listId)}
            />)
          )}
          <li>
            <section className="items">
              <NewItemControl onCreate={this.handleNewList} tagName="h2" />
            </section>
          </li>
        </ul>
      </section>
    </div>);
  }
}

export default RemindersList;
