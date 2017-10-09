import React from 'react';
import PropTypes from 'prop-types';
import Rnd from 'react-rnd';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  start: {
    border: '3px dashed green',
  },
  end: {
    border: '3px dashed red',
  },
});

const Box = ({
  order,
  size,
  position,
  onResize,
  onDrag,
}) => (
  <Rnd
    className={css(styles[order])}
    bounds='parent'
    lockAspectRatio={true}
    size={size}
    position={position}
    onResize={onResize}
    onDrag={onDrag}
  />
);

Box.propTypes = {
  order: PropTypes.oneOf(['start', 'end']).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  onDrag: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
};

export default Box;
