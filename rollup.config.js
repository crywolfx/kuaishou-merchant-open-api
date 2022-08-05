import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
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
  json(),
  commonjs(),
  BABEL_ENV === 'umd' && nodePolyfills(),
].filter(Boolean);



const umdOutput = {
  format: 'umd',
  name: 'VisionLib',
  globals,
  assetFileNames: '[name].[ext]',
  exports: 'named',
};

const esOutput = {
  globals,
  preserveModules: true,
  preserveModulesRoot: 'packages',
  exports: 'named',
}

const moduleContext = (id) => {
  const thisAsWindowForModules = [
    'node_modules/class-validator/esm5/validation/Validator.js',
    'node_modules/class-validator/esm5/decorator/common/ValidateNested.js'
  ];

  if (thisAsWindowForModules.some(id_ => id.trimRight().endsWith(id_))) {
    return 'globalThis';
  }
}


export default () => {
  switch (BABEL_ENV) {
    case 'umd':
      return [{
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.development.js' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      }, {
        input: entry,
        output: { ...umdOutput, file: 'dist/visible-lib.production.min.js', plugins: [terser()] },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      }];
    case 'esm':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: 'es/', format: 'es' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      };
    case 'cjs':
      return {
        input: [entry],
        preserveModules: true,
        output: { ...esOutput, dir: 'lib/', format: 'cjs' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      };
    default:
      return [];
  }
};