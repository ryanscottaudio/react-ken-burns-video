import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';
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

const startingArea = 50000;

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
    this.getImageSizeRatio = this.getImageSizeRatio.bind(this);
    this.getActualBoxCoords = this.getActualBoxCoords.bind(this);
    this.drawPreviews = this.drawPreviews.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onBoxDrag = this.onBoxDrag.bind(this);
    this.onBoxResize = this.onBoxResize.bind(this);
  }

  componentDidMount() {
    const { setState, imageElement, onResize, getImageSizeRatio } = this;

    imageElement.onload = () => {
      setState({
        imageLoaded: true,
        imageSizeRatio: getImageSizeRatio(),
      });
    };

    window.addEventListener('resize', onResize);
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

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    const { state: { imageSizeRatio }, getImageSizeRatio } = this;
    const idealImageSizeRatio = getImageSizeRatio();

    if (idealImageSizeRatio !== imageSizeRatio) {
      this.setState({ imageSizeRatio: idealImageSizeRatio });
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

  onBoxResize(order, { width, height, x, y }) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      area: width * height,
      position: { x, y },
      isDrawn: false,
    } });
  }

  getImageSizeRatio() {
    const { clientWidth, naturalWidth } = this.imageElement;

    return clientWidth / naturalWidth;
  }

  getActualBoxCoords({ x, y, width, height }) {
    const { imageSizeRatio } = this.state;

    return {
      x: x / imageSizeRatio,
      y: y / imageSizeRatio,
      width: width / imageSizeRatio,
      height: height / imageSizeRatio,
    };
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
      getActualBoxCoords,
    } = this;

    ['start', 'end'].forEach((order) => {
      const canvas = previewCanvases[order];

      const { position: { x, y }, area } = state[order];
      const { height: boxHeight, width: boxWidth } = getSize({ area, aspectRatio: width / height });
      const actualCoords = getActualBoxCoords({ x, y, width: boxWidth, height: boxHeight });
      canvas
        .getContext('2d')
        .drawImage(
          imageElement,
          actualCoords.x,
          actualCoords.y,
          actualCoords.width,
          actualCoords.height,
          0,
          0,
          canvas.width,
          canvas.height // eslint-disable-line comma-dangle
        );
    });
  }

  renderVideo(cb) {
    const {
      props: { duration, framerate, imageSrc, width, height, sync },
      state: { start, end },
      getActualBoxCoords,
      setState,
    } = this;

    setState({ renderingVideo: true, renderedVideoProgress: 0 });

    compileVideo({
      duration,
      framerate,
      imageSrc,
      width,
      height,
      start: getActualBoxCoords({
        ...start.position,
        ...getSize({ area: start.area, aspectRatio: width / height }),
      }),
      end: getActualBoxCoords({
        ...end.position,
        ...getSize({ area: end.area, aspectRatio: width / height }),
      }),
      sync,
      onProgress: (progress) => {
        setState({ renderedVideoProgress: progress });
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
        sync,
        progressIndicator,
        className,
        style,
        previewPaneClassName,
        previewPaneStyle,
        previewPaneLabelClassName,
        previewPaneLabelStyle,
      },
      state,
      onBoxResize,
      onBoxDrag,
    } = this;
    const { renderingVideo, renderedVideoProgress } = state;

    if (renderingVideo) {
      if (sync) {
        return (progressIndicator ? progressIndicator() : <div>Rendering synchronously...</div>);
      }

      return progressIndicator
        ? progressIndicator(renderedVideoProgress)
        : (<div style={{ height: 20, width: '100%' }}>
          <div
            style={{
              backgroundColor: 'black',
              height: '100%',
              width: `${renderedVideoProgress * 100}%`,
            }}
          />
        </div>);
    }

    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          ...style,
        }}
      >
        <div
          style={{
            height: 'calc(100% - 20px)',
            margin: 10,
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'flex-start',
          }}
        >
          <img
            style={{ height: '100%' }}
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
                  ...newPosition,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                })}
              />
            );
          })}
        </div>
        <div style={{ flex: 1 }}>
          {['start', 'end'].map(order => (
            <div
              key={order} className={previewPaneClassName} style={{
                display: 'inline-block',
                width: 'calc(50% - 20px)',
                margin: 10,
                ...previewPaneStyle,
              }}
            >
              <div className={previewPaneLabelClassName} style={previewPaneLabelStyle}>
                {order === 'start' ? 'Start' : 'End'}
              </div>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 0,
                  paddingBottom: `${100 * (height / width)}%`,
                }}
              >
                <canvas
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                  ref={node => (this.previewCanvases[order] = node)}
                />
              </div>
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
  progressIndicator: PropTypes.func,
  className: PropTypes.string,
  style: stylePropType,
  previewPaneClassName: PropTypes.string,
  previewPaneStyle: stylePropType,
  previewPaneLabelClassName: PropTypes.string,
  previewPaneLabelStyle: stylePropType,
};

export default Component;
