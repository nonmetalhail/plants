/* eslint-env node */
import json from "@rollup/plugin-json";
import node from 'rollup-plugin-node-resolve';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: path.resolve(__dirname, 'src/d3_bundle/d3_pkgs.js'),
  plugins: [
    node(),
    json()
  ],
  output: {
    extend: true,
    file: path.resolve(__dirname, 'src/d3_bundle/dist/pd3.js'),
    format: 'es',
    indent: false,
    name: 'd3'
  }
};