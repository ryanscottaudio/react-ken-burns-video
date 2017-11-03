import React from 'react';
import PropTypes from 'prop-types';
import Rnd from 'react-rnd';


const Box = ({
  order,
  size,
  position,
  onResize,
  onDrag,
}) => (
  <Rnd
    style={{ border: `5px dashed ${order === 'start' ? 'green' : 'red'}` }}
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
