import { defineConfig } from 'vite';
import json from '@rollup/plugin-json';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    json(),
    {
      ...typescript({
        check: true,
        tsconfig: resolve(__dirname, './tsconfig.json'), // your tsconfig.json path
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: false,
            declaration: true,
            declarationMap: false,
          },
          include: ['package/**/*'],
          exclude: ['node_modules'],
        },
        abortOnError: true,
      }),
      enforce: 'pre',
    },
    getBabelOutputPlugin({
      allowAllFormats: true,
      exclude: 'node_modules/**', // 只编译源代码
      extensions: ['.ts', '.vue', '.js'],
      plugins: ['@babel/plugin-proposal-optional-chaining'],
    }),
    terser(),
    nodeResolve(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    commonjs(),
  ],
  resolve: {
    alias: {
      '@': resolve('./'),
    },
  },
  build: {
    sourcemap: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'package/index.ts'),
      name: 'Vats',
      formats: ['umd'],
      fileName: 'index',
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'vue',
        'ant-design-vue',
        'ant-design-vue/dist/antd.css',
        'dayjs',
        './dayjs',
        'vue-router',
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'ant-design-vue': 'antd',
          dayjs: 'dayjs',
          './dayjs': 'dayjs',
          'ant-design-vue/dist/antd.css': 'antd',
        },
      },
      plugins: [json()],
    },
    terserOptions: {
      compress: {
        ecma: 2015,
        drop_console: false,
      },
    },
    commonjsOptions: {
      sourceMap: false,
    },
  },
});
