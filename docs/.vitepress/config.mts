import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'sweyn docs',
  base: '/sweyn/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Config', link: '/config' },
          { text: 'Directories', link: '/directories' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'CMS', link: '/cms' },
          { text: 'Database', link: '/database' },
          { text: 'Renderer', link: '/renderer' },
          { text: 'HMR', link: '/hmr' },
        ],
      },
    ],
  },
})
