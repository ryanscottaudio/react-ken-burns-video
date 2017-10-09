import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, css } from 'aphrodite';
import compileVideo from './compile-video';
import Box from './components/box';

const getSize = ({ area, aspectRatio }) => {
  const height = Math.sqrt(area / aspectRatio);

  return {
    width: height * aspectRatio,
    height,
  };
};

const startingPosition = {
  x: 0,
  y: 0,
};

const startingArea = 10000;

const styles = StyleSheet.create({
  container: {
    display: 'inline-flex',
    position: 'relative',
    border: '1px solid black',
  },
});

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      start: {
        position: startingPosition,
        area: startingArea,
      },
      end: {
        position: startingPosition,
        area: startingArea,
      },
    };

    this.setState = this.setState.bind(this);
    this.onBoxDrag = this.onBoxDrag.bind(this);
    this.onBoxResize = this.onBoxResize.bind(this);
  }

  onBoxDrag(order, position) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      position,
    } });
  }

  onBoxResize(order, { width, height }, position) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      area: width * height,
      position,
    } });
  }

  save(cb) {
    const { props: { imageSrc, width, height }, state: { start, end } } = this;

    compileVideo({
      imageSrc,
      width,
      height,
      start: {
        ...start.position,
        ...getSize({ area: start.area, aspectRatio: width / height }),
      },
      end: {
        ...end.position,
        ...getSize({ area: end.area, aspectRatio: width / height }),
      },
    }, cb);
  }

  render() {
    const {
      props: {
        imageSrc,
        width,
        height,
      },
      state,
      onBoxResize,
      onBoxDrag,
    } = this;

    return (
      <div>
        <div className={css(styles.container)}>
          <img
            src={imageSrc}
            role='presentation'
          />
          {['start', 'end'].map((order) => {
            const { area, position } = state[order];

            return (
              <Box
                key={order}
                order={order}
                size={getSize({ area, aspectRatio: width / height })}
                position={position}
                onDrag={(_, { x, y }) => onBoxDrag(order, { x, y })}
                onResize={(_, __, ref, ___, newPosition) => onBoxResize(order, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                }, newPosition)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

Component.propTypes = {
  imageSrc: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default Component;
