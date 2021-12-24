/* eslint-env node */
import ascii from 'rollup-plugin-ascii';
import node from 'rollup-plugin-node-resolve';
import path from 'path';

export default {
  input: path.resolve(__dirname, 'src/d3_bundle/d3_pkgs.js'),
  plugins: [
    node(),
    ascii()
  ],
  output: {
    extend: true,
    file: path.resolve(__dirname, 'src/d3_bundle/dist/pd3.js'),
    format: 'es',
    indent: false,
    name: 'd3'
  }
};