import React from 'react';
import PropTypes from 'prop-types';
import { RIEInput } from 'riek';
import Context from './Context';

const ValueEdit = ({ context }) =>
  (<RIEInput
    value={context.value}
    propName="value"
    change={({ value }) => context.patch([{ op: 'add', path: '', value }])}
  />);

ValueEdit.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default ValueEdit;
