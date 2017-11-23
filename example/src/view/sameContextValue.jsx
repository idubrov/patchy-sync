import React from 'react';
import PropTypes from 'prop-types';
import Context from './Context';

const sameContextValue = WrappedComponent =>
  class extends React.PureComponent {
    static propTypes = {
      context: PropTypes.instanceOf(Context).isRequired
    };

    shouldComponentUpdate(nextProps) {
      const ctx = this.props.context;
      const nextCtx = nextProps.context;
      return ctx.patchDocument !== nextCtx.patchDocument ||
        ctx.path !== nextCtx.path ||
        ctx.value !== nextCtx.value;
    }

    render() {
      return (<WrappedComponent {...this.props} />);
    }
  };

export default sameContextValue;
