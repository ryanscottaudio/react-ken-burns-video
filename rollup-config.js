// Rollup plugins.
import buble from 'rollup-plugin-buble';
import cjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  name: 'reactkenburnsvideo',
  input: 'index.js',
  output: {
    file: 'dist/index.js',
    format: 'iife',
  },
  plugins: [
    buble({
      objectAssign: 'Object.assign',
      exclude: ['node_modules/**'],
    }),
    cjs({
      exclude: 'node_modules/process-es6/**',
      include: [
        'node_modules/create-react-class/**',
        'node_modules/fbjs/**',
        'node_modules/object-assign/**',
        'node_modules/react/**',
        'node_modules/react-dom/**',
        'node_modules/prop-types/**',
        'node_modules/react-rnd/**',
        'node_modules/react-draggable/**',
        'node_modules/aphrodite/**',
        'node_modules/inline-style-prefixer/**',
        'node_modules/css-in-js-utils/**',
        'node_modules/string-hash/**',
        'node_modules/asap/**',
        'node_modules/hyphenate-style-name/**',
        'node_modules/js-file-download/**',
        'node_modules/whammy/**',
      ],
      namedExports: {
        'node_modules/react/react.js': [
          'cloneElement',
          'createElement',
          'PropTypes',
          'Children',
          'Component',
        ],
        'node_modules/react-dom/index.js': [
          'findDOMNode',
        ],
        'node_modules/aphrodite/lib/index.js': [
          'StyleSheet',
          'css',
        ],
        'node_modules/whammy/whammy.js': [
          'fromImageArray',
        ],
      },
    }),
    globals(),
    builtins(),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    resolve({
      browser: true,
      main: true,
    }),
    uglify(),
  ],
};
