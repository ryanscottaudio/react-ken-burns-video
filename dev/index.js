import React from 'react';
import ReactDOM from 'react-dom';
import fileDownload from 'js-file-download';
import Component from '../index';

class Wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 160,
      height: 90,
      imageSrc: 'http://images.mic.com/n7hfx8ikxoku56qwesfuabwj1dgb6tlqav4wjkz7oi4zf6lrgvuxucgcz25c4nfp.jpg',
    };
    this.onChangeWidth = this.onChangeWidth.bind(this);
    this.onChangeHeight = this.onChangeHeight.bind(this);
    this.onVideoSave = this.onVideoSave.bind(this);
  }

  onChangeWidth({ target: { value } }) {
    this.setState({ width: Number(value) });
  }

  onChangeHeight({ target: { value } }) {
    this.setState({ height: Number(value) });
  }

  onVideoSave(file) {
    this.setState({ videoSrc: (window.URL || window.webkitURL).createObjectURL(file) });
  }

  render() {
    const {
      state: {
        imageSrc,
        videoSrc,
        width,
        height,
      },
      onChangeWidth,
      onChangeHeight,
      onVideoSave,
    } = this;

    return (
      <div>
        <Component
          width={width}
          height={height}
          imageSrc={imageSrc}
          ref={node => (this.component = node)}
        />
        <div>
          Width
          <input
            type='number'
            value={width}
            onChange={onChangeWidth}
          />
          Height
          <input
            type='number'
            value={height}
            onChange={onChangeHeight}
          />
        </div>
        <button
          onClick={() => this.component.save(file => onVideoSave(file))}
        >
          Save video
        </button>
        {videoSrc && <video loop={true} autoPlay={true} controls={true} src={videoSrc} />}
      </div>
    );
  }
}

ReactDOM.render(<Wrapper />, document.querySelector('main'));
