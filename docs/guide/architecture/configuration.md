# 项目配置 (Configuration)

Anon Framework Next 引入了极简的 Vite 风格配置体系，支持通过项目根目录下的 `anon.config.php` 管理结构化配置，同时保留 `.env` 作为敏感信息和环境差异值的来源。

## 极简设计哲学

在现代前端开发中，像 `vite.config.ts` 一样，配置文件往往是空空如也的，只有当你需要覆盖框架的**默认行为**时，你才会往里面写东西。

我们把这种极致精简带到了后端。在框架内部，所有核心模块（数据库、缓存、会话、日志、队列等）都预设了开箱即用的默认值，并内置了对环境变量的 Fallback 处理。

因此，你的 `anon.config.php` 默认长这样：

```php
<?php

use Anon\Core\Support\Config;

/**
 * Anon Framework Next 核心配置文件
 *
 * 框架内建了极为完善的默认配置，所有敏感信息均可通过 `.env` 环境变量配置。
 * 你可以像使用 `vite.config.ts` 一样，在这里仅写入你想要覆盖或自定义的配置项。
 * 
 * @see https://anon.docs/guide/architecture/configuration (或者查阅本地 docs/guide/architecture/configuration.md)
 */
return Config::define([
    
    // 例如：你可以取消注释来覆盖默认的上传目录
    // 'upload' => [
    //     'path' => __DIR__ . '/run/storage/custom',
    // ],

]);
```

这种默认方式最适合新项目起步：不再有臃肿且让人摸不着头脑的一大串预设数组，保持项目的绝对纯净。

## 加载顺序

应用启动时会先加载环境文件，随后加载项目根目录下的 `anon.config.php`。

当前支持以下环境文件：

- `.env`
- `.env.local`
- `.env.{APP_ENV}`
- `.env.{APP_ENV}.local`

## 按需覆盖 (Overrides)

虽然配置是空的，但框架允许你在里面按需覆盖任何模块的内部配置。例如：

如果你想修改缓存的前缀：

```php
return Config::define([
    'cache' => [
        'prefix' => 'my_custom_project:',
    ],
]);
```

如果你想强制开启 JWT 双 Token 刷新机制：

```php
return Config::define([
    'auth' => [
        'refresh_enabled' => true,
    ],
]);
```

如果你想自定义控制多套用户体系 (Guard)：

```php
return Config::define([
    'auth' => [
        'guards' => [
            'admin' => [
                'ttl' => 7200,
            ],
            'api' => [
                'ttl' => 86400,
            ],
        ],
    ],
]);
```

## 读取配置

框架提供了 `Config` 门面，可通过点号语法读取配置：

```php
use Anon\Core\Facade\Config;

$uploadPath = Config::get('upload.path');
$dbName = Config::get('database.database');
```

## 配置缓存

在生产环境中为了提高性能，避免频繁的文件 IO 读取和数组合并，框架支持将配置预编译为单文件缓存：

```bash
# 生成配置缓存
php anon config:cache

# 清理配置缓存
php anon config:clear
```

当配置被缓存后，系统将直接从 `runtime/cache/config.php` 加载静态数组，此时 `.env` 环境变量文件将不再被解析，所有的环境依赖（`getenv()`）都已经被固定为缓存时的值。

**注意：** 如果你在修改了 `.env` 或者 `anon.config.php` 之后发现配置没有生效，请确保先运行 `php anon config:clear`。

## 当前已接入模块

目前以下核心模块支持从 `anon.config.php` 读取配置，但骨架默认不会全部预置：

- `app`
- `database`
- `redis`
- `cache`
- `session`
- `storage`
- `auth`
- `queue`
- `log`

## 迁移建议

- 旧项目可以先保留 `.env` 原配置不动。
- 新增 `anon.config.php`，只迁移你想结构化管理的部分。
- 待项目稳定后，再逐步把非敏感配置从 `.env` 挪到 `anon.config.php`。
