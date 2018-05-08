
import { minify } from 'uglify-es';
import uglify from 'rollup-plugin-uglify';
import shebang from 'rollup-plugin-shebang';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  external: ['child_process', 'util'],
  plugins: [
    commonjs(),
    uglify({}, minify),
    shebang(),
  ],
};
