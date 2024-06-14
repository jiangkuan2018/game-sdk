import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "H5出海开发者中心",
  titleTemplate: 'Custom Suffix',
  description: "H5出海开发者中心",
  head: [
    ['link', { rel: 'icon', href: '/logo.jpg' },],
    ['link',{ rel: 'stylesheet', href: 'https://unpkg.com/tailwindcss@2.0.4/dist/tailwind.min.css' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.jpg',
    nav: [
      { text: '接入指南', link: '/guide/unity-guide' },
      { text: '资源下载', link: '/download' }
    ],
    sidebar: [
      {
        items: [
          // { text: '接入指南', link: 'guide' },
          { text: 'Unity游戏SDK对接流程', link: '/guide/unity-guide' },
          { text: 'cocos游戏SDK对接流程', link: '/guide/cocos-guide' },
        ]
      }
    ],

    socialLinks: [
      // { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
    }
  }
})
