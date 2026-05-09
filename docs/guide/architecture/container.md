# 依赖注入容器 (Container)

Anon Framework Next 提供了一个轻量级但功能极其强大的**依赖注入容器 (IoC Container)**。它是整个框架运作的基石，负责管理类依赖并执行自动依赖注入（依赖装配）。

---

## 什么是容器？

简而言之，容器就像一个“对象制造机”和“对象仓库”。当你需要一个类的实例时，你不需要去 `new ClassName()`，而是告诉容器“我需要这个类”，容器会利用 **PHP 反射 (Reflection)** 自动分析这个类构造函数需要的其他依赖，并自动帮你把那些依赖也实例化好，最后把组装好的对象交给你。

---

## 获取容器实例

`Anon\Core\Foundation\App` 类继承自 `Container`。因此，整个应用程序 `App` 本身就是一个巨大的容器单例。你可以通过以下方式获取它：

```php
use Anon\Core\Foundation\App;

$app = App::getInstance();
```

---

## 基本用法

### 1. 自动依赖解析 (Make)

假设你有一个控制器，它的构造函数需要一个 `UserService`：

```php
namespace Anon\Controller;

use Anon\Service\UserService;

class UserController
{
    protected UserService $userService;

    // 容器会自动发现你需要 UserService，并自动实例化传进来！
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
}
```

当路由调度到这个控制器时，底层会调用 `$app->make(UserController::class)`，容器会自动反射出它依赖了 `UserService`，并一并实例化。

### 2. 手动绑定 (Bind)

有时候你希望给接口绑定一个具体实现，或者自定义实例化的逻辑：

```php
$app = App::getInstance();

// 绑定一个类名
$app->bind('cache', \Anon\Core\Cache\RedisCache::class);

// 绑定一个闭包（每次 make 都会执行闭包）
$app->bind('config', function ($app) {
    return new ConfigLoader('/path/to/config');
});

// 解析出来
$cache = $app->make('cache');
```

### 3. 绑定单例 (Instance)

如果你已经有一个现成的对象，希望它在全局保持单例，可以使用 `instance` 方法：

```php
$app = App::getInstance();

$myObject = new stdClass();
$myObject->name = "Anon";

$app->instance('my_shared_object', $myObject);

// 在项目的任何地方，取出的都是同一个对象
$sameObject = $app->make('my_shared_object');
```

---

## 核心组件的别名

框架启动时，已经自动在容器中绑定了以下核心组件，你可以随时通过 `$app->make('别名')` 获取它们的单例：

| 别名 | 绑定的类 | 作用 |
| :--- | :--- | :--- |
| `app` | `Anon\Core\Foundation\App` | 应用容器自身 |
| `router` | `Anon\Core\Routing\Router` | 路由解析器 |
| `db` | `Anon\Core\Database\Connection` | 数据库连接管理 |
| `log` | `Anon\Core\Log\Logger` | 日志记录器 |
| `env` | `Anon\Core\Support\Env` | 环境变量解析器 |
| `cache` | `Anon\Core\Cache\Manager` | 缓存管理器 |
| `session` | `Anon\Core\Session\Manager` | Session 管理器 |
| `validator` | `Anon\Core\Validation\Factory` | 验证器工厂 |
| `event` | `Anon\Core\Event\Dispatcher` | 事件调度器 |
| `request` | `Anon\Core\Http\Request` | 当前 HTTP 请求对象 |
| `auth` | `Anon\Core\Auth\AuthManager` | JWT 身份认证 |
| `storage` | `Anon\Core\Storage\Manager` | 文件存储管理器 |