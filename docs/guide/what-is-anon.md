# Anon Framework Next

Anon Framework Next 是一款现代化的双模 PHP 框架，专为 API 场景设计。底层参考 ThinkPHP8 与 Laravel 架构。

## 核心特性

- **路由系统**：支持路由组、嵌套与中间件绑定。
- **中间件**：基于洋葱模型，控制请求和响应的生命周期。
- **响应处理**：针对 RESTful API 设计，默认提供 JSON 响应。
- **自动加载**：基于 Composer 自动加载构建。

## 快速开始

### 安装

使用 Composer 在本地安装或创建项目：

```bash
composer create-project yuinijika/anon my-app
cd my-app
```

### 运行

框架内置了 Console 命令行工具，用于启动开发服务器：

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
