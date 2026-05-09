# 环境变量 (Env)

Anon Framework Next 提供了对 `.env` 文件的原生支持。环境变量是配置应用不同环境（如本地开发、测试服务器、生产环境）参数的最佳实践。

默认情况下，项目骨架在根目录下会包含一个 `.env` 文件（或 `.env.example`）。

## 基础配置

典型的 `.env` 文件内容如下：

```env
# 应用配置
APP_NAME="Anon Framework Next"
APP_ENV=local
DEBUG_MODE=true
APP_URL=http://localhost:8000

# 数据库配置
# 支持的类型: mysql, pgsql, sqlite, sqlsrv, oracle
DATABASE_TYPE=mysql
DATABASE_URL=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=anon_test
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_CHARSET=utf8mb4

# 缓存配置
CACHE_DRIVER=file

# Session 配置
SESSION_DRIVER=file
SESSION_LIFETIME=86400

# 身份认证配置
JWT_SECRET=your_super_secret_key
```

### APP_ENV 环境变量

`APP_ENV` 代表了**当前应用程序的运行环境标识 (Application Environment)**。常见的定义有：

- **`local` (本地开发环境)**：往往开启详细的报错信息、使用本地轻量级的缓存驱动。
- **`testing` (测试环境)**：通常用于持续集成 (CI) 或专门的测试服务器。
- **`staging` (预发布环境)**：代码发布到正式生产服务器前的一个环境，配置与生产环境几乎一模一样。
- **`production` (正式生产环境)**：必须关闭所有的调试报错信息，开启严格的缓存和性能优化配置。

在业务代码中，你可以通过判断该标识来执行不同的逻辑：

```php
use Anon\Core\Facade\Env;

if (APP_ENV === 'local') {
    // 调用 Mock 接口
} else {
    // 调用真实线上接口
}
```

## 全局常量

框架在启动时，会自动将最常用的几个环境变量解析并挂载为 PHP 全局常量，方便在项目的任何地方直接使用，无需反复调用 `Env::get()`：

- **`APP_NAME`**：应用名称。
- **`APP_ENV`**：运行环境。
- **`APP_URL`**：应用外网访问地址（未定义时会自动根据当前 HTTP 请求智能推导）。
- **`DEBUG_MODE`**：调试模式布尔值（为 `true` 时发生致命错误会直接在页面上打印错误堆栈）。

```php
// 直接使用全局常量
echo "当前环境: " . APP_ENV;
echo "访问地址: " . APP_URL;

if (DEBUG_MODE) {
    // ...
}
```

## 获取环境变量

你可以通过 `Anon\Core\Facade\Env` 门面来获取环境变量。

```php
use Anon\Core\Facade\Env;
// 获取 DEBUG_MODE，如果不存在则返回 false
$isDebug = Env::get('DEBUG_MODE', false);
```

### 数据类型自动转换

`.env` 文件中所有的值本质上都是字符串，但 Env 组件在解析时会自动将其转换为 PHP 的标量类型：

- `true`, `on`, `yes` 会被转换为布尔值 `true`
- `false`, `off`, `no` 会被转换为布尔值 `false`
- `null`, `empty` 会被转换为 `null`
- 纯数字会被转换为对应的 `int` 或 `float`

## 动态设置环境变量

你也可以在运行时动态修改或追加环境变量。修改后的变量会被同步设置到 PHP 原生的 `$_ENV` 以及 `putenv()` 中。

```php
use Anon\Core\Facade\Env;

// 动态设置环境标识
Env::set('APP_ENV', 'production');
```
