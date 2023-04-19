import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  externals: ['@/shared'],
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
    esbuild: {
      target: 'es2017',
    },
  },
})
