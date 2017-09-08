import React from 'react';
import PropTypes from 'prop-types';
import Context from './Context';

const DeleteFromList = ({ context }) =>
  (<button
    className="delete-btn"
    onClick={() => {
      const listContext = context.up();
      const last = context.last();
      const index = listContext.value.$order.indexOf(last);
      if (index !== -1) {
        listContext.patch([
          { op: 'test', path: `$order/${index}`, value: last },
          { op: 'remove', path: `$order/${index}` },
          { op: 'remove', path: last }
        ]);
      }
    }}
  >
    <i className="fa fa-trash-o" />
  </button>);

DeleteFromList.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default DeleteFromList;
