# Anon Framework Next

Anon Framework Next 是一款现代化的双模 PHP 框架，专为 API 与 CMS 场景设计。底层参考 ThinkPHP8 与 Laravel 架构，提供极其优雅的开发体验。

## 核心特性

- **极致优雅的路由**：支持路由组、嵌套与中间件绑定，API 就像说话一样自然。
- **洋葱模型中间件**：完美控制请求和响应的生命周期。
- **强制 JSON 响应**：原生针对 RESTful API 打造，彻底告别拼装头信息的烦恼。
- **轻量且强大**：基于 Composer 自动加载构建，即插即用。

## 快速开始

### 安装

使用 Composer 在本地安装或创建项目：

```bash
composer create-project yuinijika/anon my-app
cd my-app
```

### 运行

框架内置了 Console 命令行工具，可以非常快速地启动开发服务器：

```bash
php anon dev
```

打开浏览器访问 `http://localhost:8000/`，你将看到：

```json
{
    "code": 200,
    "message": "Welcome to Anon Framework Next API",
    "data": {
        "name": "Anon Next",
        "version": "1.0.0",
        "php_version": "8.x.x",
        "os": "Windows",
        "base_path": "...",
        "method": "GET",
        "uri": "/",
        "timestamp": 1715200000
    }
}
```

---

请从左侧导航栏开始阅读详细的开发指南。
