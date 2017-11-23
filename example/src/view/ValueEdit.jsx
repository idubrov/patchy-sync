import React from 'react';
import PropTypes from 'prop-types';
import { RIEInput } from 'riek';
import Context from './Context';
import sameContextValue from './sameContextValue';

const ValueEdit = ({ context }) =>
  (<RIEInput
    value={context.value}
    propName="value"
    shouldBlockWhileLoading
    classEditing="inline"
    change={({ value }) => context.patch([{ op: 'test', path: '', value: context.value }, { op: 'add', path: '', value }])}
  />);

ValueEdit.propTypes = {
  context: PropTypes.instanceOf(Context).isRequired
};

export default sameContextValue(ValueEdit);
