import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const BABEL_ENV = process.env.BABEL_ENV || 'esm';

const entry = 'packages/index.ts';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const globals = {};
const externalPkg = [];
BABEL_ENV !== 'umd' && externalPkg.push('@babel/runtime');
const external = id => externalPkg.some(e => id.indexOf(e) === 0);

const commonPlugins = [
  resolve({ extensions }),
  typescript({ useTsconfigDeclarationDir: true }),
  babel({
    exclude: '**/node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'runtime',
    presets: [
      [
        "@babel/preset-env",
      ],
    ],
    plugins: [['@babel/plugin-transform-runtime']]
  }),
  commonjs(),
  json()
];



const umdOutput = {
  format: 'umd',
  name: 'VisionLib',
  globals,
  assetFileNames: '[name].[ext]'
};

const esOutput = {
  globals,
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
}


export default () => {
  switch (BABEL_ENV) {
    case 'umd':
      return [{
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.development.js' },
        external,
        plugins: [...commonPlugins]
      }, {
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.production.min.js', plugins: [terser()] },
        external,
        plugins: [...commonPlugins]
      }];
    case 'esm':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: 'es/', format: 'es' },
        external,
        plugins: [...commonPlugins]
      };
    case 'cjs':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: 'lib/', format: 'cjs' },
        external,
        plugins: [...commonPlugins]
      };
    default:
      return [];
  }
};