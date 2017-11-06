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

const startingPosition = {
  x: 0,
  y: 0,
};

const startingSize = {
  width: 100,
  height: 100,
};

const containerMargin = 5;
const containerStyle = {
  position: 'relative',
  height: '100%',
  width: `calc(50% - ${containerMargin}px)`,
  margin: `0 ${containerMargin}px`,
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
        size: startingSize,
      },
      end: {
        position: startingPosition,
        size: startingSize,
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
    this.cancelVideoRender = this.cancelVideoRender.bind(this);
    this.renderVideo = this.renderVideo.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onBoxDrag = this.onBoxDrag.bind(this);
    this.onBoxResize = this.onBoxResize.bind(this);
  }

  componentDidMount() {
    const { imageElement, onResize, setElementSizes } = this;

    imageElement.onload = () => {
      setElementSizes();
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
        setElementSizes();
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
    } });
  }

  onBoxResize(order, { width, height, x, y }) {
    const { setState, state } = this;

    setState({ [order]: {
      ...state[order],
      size: { width, height },
      position: { x, y },
    } });
  }

  setElementSizes() {
    const {
      props: { width: previewWidth, height: previewHeight },
      imageElement,
      imageContainerElement,
      previewContainers,
      previewCanvases,
      state,
      setState,
    } = this;
    const { imageSizeRatio, imageLoaded } = state;
    const { naturalWidth, naturalHeight } = imageElement;

    const newState = {};

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

    imageElement.style.width = imageWidth;
    imageElement.style.height = imageHeight;

    const newImageSizeRatio = imageWidth / naturalWidth;
    const imageSizeRatioCoefficient = newImageSizeRatio / imageSizeRatio;

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

      const { width: boxWidth, height: boxHeight } = getElementSize({
        element: {
          width: previewWidth,
          height: previewHeight,
        },
        container: {
          width: imageWidth,
          height: imageHeight,
        },
      });

      if (!imageLoaded) {
        newState[order] = {
          ...state[order],
          size: { width: boxWidth, height: boxHeight },
        };
      } else if (newImageSizeRatio !== imageSizeRatio) {
        const { position, size } = state[order];

        newState[order] = {
          position: {
            x: imageSizeRatioCoefficient * position.x,
            y: imageSizeRatioCoefficient * position.y,
          },
          size: {
            width: imageSizeRatioCoefficient * size.width,
            height: imageSizeRatioCoefficient * size.height,
          },
        };
      }
    });

    if (newImageSizeRatio !== imageSizeRatio || !imageLoaded) {
      newState.imageSizeRatio = newImageSizeRatio;
      if (!imageLoaded) {
        newState.boxMaxWidth = naturalWidth;
        newState.boxMaxHeight = naturalHeight;
        newState.imageLoaded = true;
      }
      setState(newState);
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
      state: { start, end },
      getActualBoxCoords,
    } = this;

    return {
      start: getActualBoxCoords({
        ...start.position,
        ...start.size,
      }),
      end: getActualBoxCoords({
        ...end.position,
        ...end.size,
      }),
    };
  }

  drawPreviews() {
    const {
      state,
      imageElement,
      previewCanvases,
      getActualBoxCoords,
    } = this;

    boxNames.forEach((order) => {
      const canvas = previewCanvases[order];

      const { position: { x, y }, size: { width, height } } = state[order];
      const actualCoords = getActualBoxCoords({ x, y, width, height });
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

  cancelVideoRender() {
    const { cancelVideoRender } = this.state;
    if (cancelVideoRender) cancelVideoRender();
  }

  renderVideo(cb) {
    const {
      props: { duration, framerate, imageSrc, width, height, sync },
      getBoxPositions,
      setState,
    } = this;

    const { cancelVideoRender } = renderVideo({
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

    setState({ renderingVideo: true, renderedVideoProgress: 0, cancelVideoRender });
  }

  render() {
    const {
      props: {
        imageSrc,
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
            marginLeft: 0,
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
                const { size, position } = state[order];

                return (
                  <Box
                    key={order}
                    order={order}
                    size={size}
                    position={position}
                    maxWidth={state.boxMaxWidth}
                    maxHeight={state.boxMaxHeight}
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
            marginRight: 0,
          }}
        >
          {boxNames.map(order => (
            <div
              key={order}
              className={previewPaneClassName}
              ref={node => (this.previewContainers[order] = node)}
              style={{
                position: 'relative',
                height: '100%',
                width: `calc(50% - ${containerMargin}px)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: order === 'start' ? containerMargin : undefined,
                marginLeft: order === 'end' ? containerMargin : undefined,
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
                    backgroundColor: order === 'start' ? 'rgba(0, 128, 0, 0.75)' : 'rgba(255, 0, 0, 0.75)',
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

export { Component, renderVideo };
