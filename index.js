import React from 'react';
import PropTypes from 'prop-types';
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

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      start: {
        position: startingPosition,
        area: startingArea,
        isDrawn: false,
      },
      end: {
        position: startingPosition,
        area: startingArea,
        isDrawn: false,
      },
      imageLoaded: false,
      renderingVideo: false,
    };
    this.previewCanvases = {};

    this.setState = this.setState.bind(this);
    this.drawPreviews = this.drawPreviews.bind(this);
    this.onBoxDrag = this.onBoxDrag.bind(this);
    this.onBoxResize = this.onBoxResize.bind(this);
  }

  componentDidMount() {
    const { setState, imageElement } = this;

    imageElement.onload = () => {
      setState({ imageLoaded: true });
    };
  }

  componentDidUpdate({ imageSrc: oldImageSrc }) {
    const {
      props: { imageSrc },
      state: { imageLoaded, renderingVideo },
      setState,
      drawPreviews,
      imageElement,
    } = this;

    if (imageSrc !== oldImageSrc) {
      setState({ imageLoaded: false });
      imageElement.onload = () => {
        setState({ imageLoaded: true });
      };
    } else if (imageLoaded && !renderingVideo) {
      drawPreviews();
    }
  }

  onBoxDrag(order, position) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      position,
      isDrawn: false,
    } });
  }

  onBoxResize(order, { width, height }, position) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      area: width * height,
      position,
      isDrawn: false,
    } });
  }

  drawPreviews() {
    const {
      props: {
        width,
        height,
      },
      state,
      imageElement,
      previewCanvases,
    } = this;

    ['start', 'end'].forEach((order) => {
      const canvas = previewCanvases[order];

      const { position: { x, y }, area } = state[order];
      const { height: boxHeight, width: boxWidth } = getSize({ area, aspectRatio: width / height });
      canvas
        .getContext('2d')
        .drawImage(imageElement, x, y, boxWidth, boxHeight, 0, 0, canvas.width, canvas.height);
    });
  }

  renderVideo(cb) {
    const {
      props: { duration, framerate, imageSrc, width, height, sync },
      state: { start, end },
      setState,
    } = this;

    setState({ renderingVideo: true, renderedVideoPercentage: 0 });

    compileVideo({
      duration,
      framerate,
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
      sync,
      onProgress: (percentDone) => {
        setState({ renderedVideoPercentage: percentDone });
      },
      onDone: (file) => {
        setState({ renderingVideo: false });
        cb(file);
      },
    });
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

    if (state.renderingVideo) {
      // TODO: Add more graceful rendering indicator
      return <div>{`Rendering video: ${state.renderedVideoPercentage}% done`}</div>;
    }

    return (
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'inline-flex', position: 'relative', border: '1px solid black' }}>
          <img
            src={imageSrc}
            role='presentation'
            ref={node => (this.imageElement = node)}
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
        <div>
          {['start', 'end'].map(order => (
            <div key={order}>
              <div>
                {order === 'start' ? 'Start' : 'End'}
              </div>
              {state.imageLoaded ? <canvas
                style={{ width, height }}
                ref={node => (this.previewCanvases[order] = node)}
              /> : 'Loading image'}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

Component.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  framerate: PropTypes.number,
  sync: PropTypes.bool,
};

export default Component;
