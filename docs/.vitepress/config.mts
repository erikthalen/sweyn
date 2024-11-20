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
          { text: 'CMS', link: '/cms' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Renderer', link: '/renderer' },
        ],
      },
    ],
  },
})
