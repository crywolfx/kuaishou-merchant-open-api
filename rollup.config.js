import typescript from 'rollup-plugin-typescript2';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: {
    index: './packages/index.ts',
    dd: './packages/dd.ts'
  },
  output: {
    exports: 'auto',
    dir: './lib',
    format: 'cjs',
  },
  watch: {
    include: 'packages/**',
  },
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(),
    resolve()
  ]
}
