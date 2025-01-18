import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Sweyn',
  base: '/sweyn/',
  head: [['link', { rel: 'icon', href: './S.svg' }]],
  cleanUrls: true,
  themeConfig: {
    logo: '/S.svg',
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
          // { text: 'Directories', link: '/directories' },
        ],
      },
      {
        text: 'Directories',
        items: [
          { text: '/api', link: '/directories/api' },
          { text: '/app', link: '/directories/app' },
          { text: '/content', link: '/directories/content' },
          { text: '/pages', link: '/directories/pages' },
          { text: '/public', link: '/directories/public' },
          { text: '/snippets', link: '/directories/snippets' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'CMS', link: '/cms' },
          { text: 'Analytics', link: '/analytics' },
          { text: 'Database', link: '/database' },
          { text: 'Renderer', link: '/renderer' },
          { text: 'HMR', link: '/hmr' },
        ],
      },
    ],
  },
})
