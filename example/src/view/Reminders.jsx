import React from 'react';
import PropTypes from 'prop-types';
import ReminderList from './ReminderList';
import Context from './Context';

class RemindersList extends React.PureComponent {
  static propTypes = {
    document: PropTypes.shape({
      lists: PropTypes.shape({
        $order: PropTypes.arrayOf(PropTypes.string).isRequired
      }).isRequired
    }).isRequired,
    patchDocument: PropTypes.func.isRequired
  };

  render = () => {
    const context = new Context(this.props.document, this.props.patchDocument);
    return (<div className="reminders">
      <section className="lists">
        <h3>Reminders</h3>
        <ul>
          {this.props.document.lists.$order.map(listId =>
            (<ReminderList
              key={listId}
              context={context.into('lists', listId)}
            />)
          )}
        </ul>
      </section>
    </div>);
  }
}

export default RemindersList;
