import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  external: ['react'],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    terser(),
  ],
  output: {
    format: 'esm',
    globals: { react: 'React' },
    dir: 'dist',
    exports: 'named',
    preserveModules: true,
    entryFileNames: '[name].mjs',
  },
}
