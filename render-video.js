import assert from 'assert';
import { fromImageArray } from 'whammy';

const cornersArray = [0, 1, 2, 3];

const getCorners = ({ x, y, width, height }) => [
  [x, y],
  [x + width, y],
  [x + width, y + height],
  [x, y + height],
];

const getFrame = corners => [
  corners[0][0],
  corners[0][1],
  corners[1][0] - corners[0][0],
  corners[2][1] - corners[1][1],
];

export default ({
  duration,
  framerate = 60,
  sync,
  width,
  height,
  imageSrc,
  start,
  end,
  onProgress,
  onDone,
}) => {
  let canceled = false;

  const totalFrames = duration * framerate;
  assert(totalFrames > 1, 'total number of frames in video must be more than 1');

  const startCorners = getCorners(start);
  const endCorners = getCorners(end);

  const getDifferenceCorner = cornerIdx => [
    endCorners[cornerIdx][0] - startCorners[cornerIdx][0],
    endCorners[cornerIdx][1] - startCorners[cornerIdx][1],
  ];

  const differences = cornersArray.map(getDifferenceCorner);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const image = document.createElement('img');

  const frames = [];

  const analyzeFrame = (i) => {
    const coefficient = i / (totalFrames - 1);

    const getFrameCorner = cornerIdx => [
      startCorners[cornerIdx][0] + (coefficient * differences[cornerIdx][0]),
      startCorners[cornerIdx][1] + (coefficient * differences[cornerIdx][1]),
    ];

    const frame = getFrame(cornersArray.map(getFrameCorner));
    ctx.drawImage(image, ...frame, 0, 0, width, height);
    const dataURL = canvas.toDataURL('image/webp');
    frames.push(dataURL);

    const progress = (i + 1) / totalFrames;
    onProgress(progress);
  };

  image.onload = () => {
    let currentFrame = 0;

    if (sync) {
      for (currentFrame; currentFrame < totalFrames; currentFrame += 1) {
        analyzeFrame(currentFrame);
      }

      onDone(null, fromImageArray(frames, framerate));
    } else {
      const asyncAnalyzeFrame = () => {
        if (canceled) {
          return;
        }

        analyzeFrame(currentFrame);
        currentFrame += 1;

        if (currentFrame === totalFrames) {
          onDone(null, fromImageArray(frames, framerate));
        } else {
          requestAnimationFrame(asyncAnalyzeFrame);
        }
      };

      requestAnimationFrame(asyncAnalyzeFrame);
    }
  };

  image.onerror = (e) => {
    onDone(e);
  };

  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  // make sure the load event fires for cached images too
  if (image.complete || image.complete === undefined) {
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    image.src = imageSrc;
  }

  const cancelVideoRender = () => (canceled = true);

  return { cancelVideoRender };
};
