/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import ReactDOM from 'react-dom';
import Component from '../index';

class Wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageSrc: 'http://images.mic.com/n7hfx8ikxoku56qwesfuabwj1dgb6tlqav4wjkz7oi4zf6lrgvuxucgcz25c4nfp.jpg',
      duration: 5,
      framerate: 60,
      width: 320,
      height: 180,
      sync: false,
    };
    this.onChangeChecked = this.onChangeChecked.bind(this);
    this.onChangeImageSrc = this.onChangeImageSrc.bind(this);
    this.onChangeNumberProp = this.onChangeNumberProp.bind(this);
    this.onVideoRender = this.onVideoRender.bind(this);
  }

  onChangeChecked(prop) {
    return ({ target: { checked } }) => this.setState({ [prop]: checked });
  }

  onChangeImageSrc({ target: { value } }) {
    this.setState({ imageSrc: value });
  }

  onChangeNumberProp(prop) {
    return ({ target: { value } }) => this.setState({ [prop]: Number(value) });
  }

  onVideoRender(file) {
    this.setState({ videoSrc: (window.URL || window.webkitURL).createObjectURL(file) });
  }

  render() {
    const {
      state: {
        imageSrc,
        videoSrc,
        duration,
        framerate,
        width,
        height,
        sync,
      },
      onChangeChecked,
      onChangeImageSrc,
      onChangeNumberProp,
      onVideoRender,
    } = this;

    return (
      <div>
        <Component
          duration={duration}
          framerate={framerate}
          width={width}
          height={height}
          imageSrc={imageSrc}
          ref={node => (this.component = node)}
          sync={sync}
        />
        <div>
          Image source
          <input
            type='text'
            value={imageSrc}
            onChange={onChangeImageSrc}
          />
        </div>
        <div>
          Duration
          <input
            type='number'
            value={duration}
            onChange={onChangeNumberProp('duration')}
          />
          Framerate
          <input
            type='number'
            value={framerate}
            onChange={onChangeNumberProp('framerate')}
          />
        </div>
        <div>
          Width
          <input
            type='number'
            value={width}
            onChange={onChangeNumberProp('width')}
          />
          Height
          <input
            type='number'
            value={height}
            onChange={onChangeNumberProp('height')}
          />
        </div>
        <div>
          Render video synchronously
          <input
            type='checkbox'
            value={sync}
            onChange={onChangeChecked('sync')}
          />
          <button
            onClick={() => this.component.renderVideo(onVideoRender)}
          >
            Render video
          </button>
        </div>
        {videoSrc && <video loop={true} autoPlay={true} controls={true} src={videoSrc} />}
      </div>
    );
  }
}

ReactDOM.render(<Wrapper />, document.querySelector('main'));
