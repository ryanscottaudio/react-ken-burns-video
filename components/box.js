import React from 'react';
import PropTypes from 'prop-types';
import Rnd from 'react-rnd';


const Box = ({
  order,
  size,
  position,
  maxWidth,
  maxHeight,
  onResize,
  onDrag,
}) => (
  <Rnd
    style={{ border: `5px dashed ${order === 'start' ? 'green' : 'red'}` }}
    bounds='parent'
    lockAspectRatio={true}
    size={size}
    position={position}
    maxWidth={maxWidth}
    maxHeight={maxHeight}
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
  maxWidth: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
};

export default Box;
