import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  external: ['react'],
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    terser(),
  ],
  output: [
    {
      input: 'src/index.ts',
      format: 'esm',
      globals: { react: 'React' },
      dir: 'dist',
      exports: 'named',
      preserveModules: true,
      entryFileNames: '[name].esm.mjs',
    },
    {
      input: 'src/index.ts',
      format: 'cjs',
      globals: { react: 'React' },
      dir: 'dist',
      exports: 'named',
      preserveModules: true,
      entryFileNames: '[name].cjs.js',
    },
    ,
  ],
}
