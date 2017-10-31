/* eslint-disable import/no-extraneous-dependencies */

import replace from 'rollup-plugin-replace';
import config from '../rollup-config';

const devify = string => `dev/${string}`;

config.input = devify(config.input);
config.output.file = devify(config.output.file);
config.plugins[4] = replace({ 'process.env.NODE_ENV': JSON.stringify('development') });
config.plugins.pop();
config.sourcemap = true;

export default config;
