import { defineConfig } from 'vite';
import json from '@rollup/plugin-json';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
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
      name: 'vatsDefault',
      formats: ['umd', 'es', 'cjs'],
      fileName: 'index',
    },
    outDir: 'dist',
    emptyOutDir: false,
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
