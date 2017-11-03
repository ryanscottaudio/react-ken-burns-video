import React from 'react';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';
import renderVideo from './render-video';
import Box from './components/box';

const boxNames = ['start', 'end'];

const getElementSize = ({
  element: {
    width: elementWidth, height: elementHeight,
  },
  container: {
    width: maxWidth, height: maxHeight,
  },
}) => {
  const aspectRatio = elementWidth / elementHeight;
  const maxAspectRatio = maxWidth / maxHeight;

  let width = maxWidth;
  let height = maxHeight;
  if (maxAspectRatio > aspectRatio) {
    width = maxHeight * aspectRatio;
  } else if (maxAspectRatio < aspectRatio) {
    height = maxWidth / aspectRatio;
  }

  return {
    width,
    height,
  };
};

const getBoxSize = ({ area, aspectRatio }) => {
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

const containerMargin = 10;
const containerStyle = {
  position: 'relative',
  height: `calc(100% - ${containerMargin * 2}px)`,
  width: `calc(50% - ${containerMargin}px)`,
  margin: containerMargin,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

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
    this.previewContainers = {};
    this.previewCanvases = {};

    this.setState = this.setState.bind(this);
    this.setElementSizes = this.setElementSizes.bind(this);
    this.getActualBoxCoords = this.getActualBoxCoords.bind(this);
    this.drawPreviews = this.drawPreviews.bind(this);
    this.getBoxPositions = this.getBoxPositions.bind(this);
    this.renderVideo = this.renderVideo.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onBoxDrag = this.onBoxDrag.bind(this);
    this.onBoxResize = this.onBoxResize.bind(this);
  }

  componentDidMount() {
    const { imageElement, onResize, setElementSizes } = this;

    imageElement.onload = () => {
      setElementSizes(true);
    };

    window.addEventListener('resize', onResize);
  }

  componentDidUpdate({ imageSrc: oldImageSrc }) {
    const {
      props: { imageSrc },
      state: { imageLoaded, renderingVideo },
      setState,
      drawPreviews,
      setElementSizes,
      imageElement,
    } = this;

    if (imageSrc !== oldImageSrc) {
      setState({ imageLoaded: false });
      imageElement.onload = () => {
        setElementSizes(true);
      };
    } else if (imageLoaded && !renderingVideo) {
      drawPreviews();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize() {
    this.setElementSizes();
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

  setElementSizes(initialImageLoad) {
    const {
      props: { width: previewWidth, height: previewHeight },
      imageElement,
      imageContainerElement,
      previewContainers,
      previewCanvases,
      state: { imageSizeRatio, imageLoaded },
      setState,
    } = this;
    const { naturalWidth, naturalHeight } = imageElement;

    const { width: imageWidth, height: imageHeight } = getElementSize({
      element: {
        width: naturalWidth,
        height: naturalHeight,
      },
      container: {
        width: imageContainerElement.offsetWidth,
        height: imageContainerElement.offsetHeight,
      },
    });

    boxNames.forEach((order) => {
      const { width: previewCanvasWidth, height: previewCanvasHeight } = getElementSize({
        element: {
          width: previewWidth,
          height: previewHeight,
        },
        container: {
          width: previewContainers[order].offsetWidth,
          height: previewContainers[order].offsetHeight,
        },
      });

      previewCanvases[order].style.width = previewCanvasWidth;
      previewCanvases[order].style.height = previewCanvasHeight;
    });

    imageElement.style.width = imageWidth;
    imageElement.style.height = imageHeight;
    const idealImageSizeRatio = imageWidth / naturalWidth;
    if (idealImageSizeRatio !== imageSizeRatio || initialImageLoad) {
      setState({
        imageLoaded: initialImageLoad ? true : imageLoaded,
        imageSizeRatio: imageWidth / naturalWidth,
      });
    }
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

  getBoxPositions() {
    const {
      props: { width, height },
      state: { start, end },
      getActualBoxCoords,
    } = this;

    return {
      start: getActualBoxCoords({
        ...start.position,
        ...getBoxSize({ area: start.area, aspectRatio: width / height }),
      }),
      end: getActualBoxCoords({
        ...end.position,
        ...getBoxSize({ area: end.area, aspectRatio: width / height }),
      }),
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

    boxNames.forEach((order) => {
      const canvas = previewCanvases[order];

      const { position: { x, y }, area } = state[order];
      const {
        height: boxHeight,
        width: boxWidth,
      } = getBoxSize({ area, aspectRatio: width / height });
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
      getBoxPositions,
      setState,
    } = this;

    setState({ renderingVideo: true, renderedVideoProgress: 0 });

    renderVideo({
      ...getBoxPositions(),
      duration,
      framerate,
      imageSrc,
      width,
      height,
      sync,
      onProgress: (progress) => {
        setState({ renderedVideoProgress: progress });
      },
      onDone: (error, file) => {
        setState({ renderingVideo: false });
        cb(error, file);
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
        : (
          <div style={{ height: 20, width: '100%' }}>
            <div
              style={{
                backgroundColor: 'black',
                height: '100%',
                width: `${renderedVideoProgress * 100}%`,
              }}
            />
          </div>
        );
    }

    return (
      <div
        className={className}
        style={{
          display: 'flex',
          ...style,
        }}
      >
        <div
          ref={node => (this.imageContainerElement = node)}
          style={{
            ...containerStyle,
            marginRight: 0,
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={imageSrc}
              role='presentation'
              ref={node => (this.imageElement = node)}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              {boxNames.map((order) => {
                const { area, position } = state[order];

                return (
                  <Box
                    key={order}
                    order={order}
                    size={getBoxSize({ area, aspectRatio: width / height })}
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
          </div>
        </div>
        <div
          style={{
            ...containerStyle,
            marginLeft: 0,
          }}
        >
          {boxNames.map(order => (
            <div
              key={order}
              className={previewPaneClassName}
              ref={node => (this.previewContainers[order] = node)}
              style={{
                position: 'relative',
                height: `calc(100% - ${containerMargin * 2}px)`,
                width: `calc(50% - ${containerMargin * 2}px)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: containerMargin,
                ...previewPaneStyle,
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  className={previewPaneLabelClassName}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    fontSize: 24,
                    padding: '10px',
                    ...previewPaneLabelStyle,
                  }}
                >
                  {order === 'start' ? 'Start' : 'End'}
                </div>
                <canvas
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
  duration: PropTypes.number,
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

export { renderVideo };
