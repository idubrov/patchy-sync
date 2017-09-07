import React from 'react';
import PropTypes from 'prop-types';
import InlineEdit from 'react-edit-inline';
import Context from './Context';

const ValueEdit = ({ context }) =>
  (<InlineEdit
    text={context.value}
    paramName="value"
    change={({ value }) => context.patch([{ op: 'add', path: '', value }])}
  />);

ValueEdit.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default ValueEdit;
