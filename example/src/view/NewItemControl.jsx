import React from 'react';
import PropTypes from 'prop-types';

class NewItemControl extends React.PureComponent {
  static propTypes = {
    onCreate: PropTypes.func.isRequired,
    tagName: PropTypes.string
  };

  static defaultProps = {
    tagName: 'div'
  };

  state = { newItem: '' };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.handleCreateItem();
    }
  };

  handleCreateItem = () => {
    const value = this.state.newItem;
    this.setState({ newItem: '' });
    this.props.onCreate(value);
  };

  render = () => {
    const Tag = this.props.tagName;
    return (<Tag>
      <input
        className="new"
        value={this.state.newItem}
        onChange={e => this.setState({ newItem: e.target.value })}
        onKeyDown={this.handleKeyDown}
      />
      <button onClick={this.handleCreateItem}>
        <i className="fa fa-plus" />
      </button>
    </Tag>);
  }
}

export default NewItemControl;
