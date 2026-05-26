import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Anon Framework Next",
  description: "Anon Framework Next - A PHP backend API framework",
  // 站点配置
  head: [
    ['link', { rel: 'icon', href: '/assets/favicon.jpg' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/assets/anon.gif',
    // 搜索配置
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '重置搜索',
            footer: {
              selectText: '选择',
              navigateText: '导航',
              closeText: '关闭',
            },
          },
        }
      }
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '介绍', link: '/guide/what-is-anon' },
      {
        text: '开发指南',
        items: [
          { text: '快速开始', link: '/guide/what-is-anon' },
          { text: '核心架构', link: '/guide/architecture/request-response' },
          { text: '代码规范', link: '/guide/coding-standards' }
        ]
      }
    ],

    // 侧边栏配置
    sidebar: {
      '/guide/': [
        {
          base: '/guide/',
          text: '入门指南',
          collapsed: false,
          items: [
            { text: '介绍', link: '/what-is-anon' },
            { text: 'API 参考', link: '/architecture/api-reference' },
            { text: '开发规范', link: '/coding-standards' }
          ]
        },
        {
          base: '/guide/architecture/',
          text: 'HTTP 请求与路由',
          collapsed: false,
          items: [
            { text: '路由系统', link: '/router' },
            { text: '请求与响应', link: '/request-response' },
            { text: '表单验证请求 (Form Request)', link: '/form-request' },
            { text: 'Server Actions', link: '/server-actions' },
            { text: 'API 资源层 (Resources)', link: '/api-resource' },
            { text: 'OpenAPI 生成', link: '/openapi' },
            { text: '中间件 (Middleware)', link: '/middleware' },
            { text: 'HTTP 客户端', link: '/http-client' }
          ]
        },
        {
          base: '/guide/architecture/',
          text: '底层核心机制',
          collapsed: false,
          items: [
            { text: '依赖注入容器', link: '/container' },
            { text: '服务提供者', link: '/service-provider' },
            { text: '门面 (Facade)', link: '/facade' },
            { text: '事件系统 (Event)', link: '/event' },
            { text: '钩子系统 (Hook)', link: '/hook' },
            { text: '辅助函数 (Support)', link: '/support' },
            { text: '项目配置 (Configuration)', link: '/configuration' },
            { text: '环境变量 (Env)', link: '/env' },
            { text: '命令行控制台', link: '/console' }
          ]
        },
        {
          base: '/guide/architecture/',
          text: '数据与存储',
          collapsed: false,
          items: [
            { text: '数据库操作 (ORM)', link: '/database' },
            { text: '数据迁移与填充', link: '/migration' },
            { text: '缓存系统 (Cache)', link: '/cache' },
            { text: '文件存储 (Storage)', link: '/storage' },
            { text: '会话管理 (Session)', link: '/session' }
          ]
        },
        {
          base: '/guide/architecture/',
          text: '功能与扩展',
          collapsed: false,
          items: [
            { text: '身份认证 (JWT Auth)', link: '/auth' },
            { text: '异步任务队列 (Queue)', link: '/queue' },
            { text: '数据验证器 (Validator)', link: '/validator' },
            { text: '日志记录 (Log)', link: '/log' },
            { text: 'Markdown 解析', link: '/markdown' },
            { text: 'Widget 小部件', link: '/widget' }
          ]
        }
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YuiNijika/anon' }
    ]
  }
})
