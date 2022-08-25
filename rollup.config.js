import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';

const buildNpm = process.env.BUILD_NPM === 'true';
const BABEL_ENV = process.env.BABEL_ENV || 'esm';
const IS_UMD = BABEL_ENV === 'umd';

const entry = 'packages/index.ts';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const globals = {};
const externalPkg = buildNpm && !IS_UMD ? ['axios', 'class-validator', 'crypto-js', 'form-data', 'lodash', 'reflect-metadata', '@babel/runtime'] : [];

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
  IS_UMD && nodePolyfills()
].filter(Boolean);



const umdOutput = {
  format: 'umd',
  name: 'KuaishouMerchantOpenAPI',
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
        output: { ...umdOutput, file: 'dist/kuaishou-merchant-open-api.development.js' },
        external,
        plugins: [...commonPlugins],
        moduleContext,
      }, {
        input: entry,
        output: { ...umdOutput, file: 'dist/kuaishou-merchant-open-api.production.min.js', plugins: [terser()] },
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