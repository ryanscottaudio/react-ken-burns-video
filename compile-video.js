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
  width,
  height,
  imageSrc,
  start,
  end,
}, cb, processCb = () => {}) => {
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

  image.onload = () => {
    const frames = [];
    for (let i = 0; i < totalFrames; i += 1) {
      const coefficient = i / (totalFrames - 1);

      const getFrameCorner = cornerIdx => [
        startCorners[cornerIdx][0] + (coefficient * differences[cornerIdx][0]),
        startCorners[cornerIdx][1] + (coefficient * differences[cornerIdx][1]),
      ];

      const frame = getFrame(cornersArray.map(getFrameCorner));
      ctx.drawImage(image, ...frame, 0, 0, width, height);
      const dataURL = canvas.toDataURL('image/webp');
      frames.push(dataURL);

      processCb(((i + 1) / totalFrames) * 100);
    }

    cb(fromImageArray(frames, framerate));
  };

  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  // make sure the load event fires for cached images too
  if (image.complete || image.complete === undefined) {
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    image.src = imageSrc;
  }
};
