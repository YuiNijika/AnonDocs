# 中间件

中间件为过滤进入应用的 HTTP 请求提供了一种方便的机制。例如，你可以使用中间件来验证用户的身份鉴权。如果用户未通过认证，中间件会直接拦截并返回错误响应；如果通过认证，中间件会继续将请求传递给应用的下一个环节。

Anon Framework Next 采用经典的**洋葱模型**来实现中间件调用栈。

---

## 定义中间件

所有的中间件类应该包含一个 `handle` 方法。该方法接收当前请求 `$request` 和一个闭包 `$next`。

### 示例：前置/拦截中间件

在这个例子中，如果请求中没有携带 `token`，中间件将直接拦截并返回 `401 Unauthorized` 错误。

```php
namespace App\Middleware;

use Anon\Core\Http\Request;
use Anon\Core\Http\Response;

class AuthMiddleware
{
    public function handle(Request $request, \Closure $next): Response
    {
        // 1. 前置操作：拦截未授权的请求
        $token = $request->input('token');
        if (empty($token)) {
            return Response::error('Unauthorized: Missing token', 401);
        }

        // 2. 将请求传递给下一个中间件或最终的路由控制器
        return $next($request);
    }
}
```

### 示例：后置中间件

中间件不仅可以在请求进入控制器之前执行逻辑，也可以在控制器执行完毕生成 `Response` 后，对其进行后置处理（如修改响应头）。

```php
namespace App\Middleware;

use Anon\Core\Http\Request;
use Anon\Core\Http\Response;

class HeaderMiddleware
{
    public function handle(Request $request, \Closure $next): Response
    {
        // 先让请求继续往下走，拿到控制器生成的最终响应
        $response = $next($request);

        // 后置操作：在发送给浏览器前追加自定义头
        $response->setHeader('X-Powered-By', 'Anon-Next-Framework');

        return $response;
    }
}
```

---

## 注册与使用中间件

中间件的注册通常在路由定义中完成。你可以在 `app/route/main.php` 中按需为路由或路由组绑定中间件。

### 单路由绑定
使用 `->middleware()` 方法可以为单一路由挂载一个或多个中间件。

```php
use App\Middleware\AuthMiddleware;

Route::get('/user/profile', function () {
    return 'Profile Page';
})->middleware(AuthMiddleware::class);
```

### 路由组绑定
你可以为整个路由组绑定中间件，可以通过属性数组风格，或者链式调用。

```php
use App\Middleware\AuthMiddleware;

// 使用属性数组风格配置路由组
Route::group(['prefix' => '/admin', 'middleware' => AuthMiddleware::class], function ($route) {
    $route->get('/dashboard', function () {
        return 'Admin Dashboard';
    });
});
```

### 全局中间件
如果你希望中间件在处理每一个 HTTP 请求时都会被执行，你可以使用 `Route::globalMiddleware()` 注册全局中间件。通常在 `app/hook.php` 的 `app_init` 钩子或服务提供者中进行注册。

```php
use Anon\Core\Facade\Route;
use Anon\Core\Facade\Hook;
use Anon\Core\Http\Middleware\Cors;

Hook::add('app_init', function () {
    // 注册跨域处理全局中间件
    Route::globalMiddleware(Cors::class);
});
```

---

## 内置中间件

框架内置了一些常用的基础中间件，它们位于 `Anon\Core\Http\Middleware` 命名空间下。

### CORS 跨域中间件 (Cors)

在前后端分离架构下，处理跨域资源共享（CORS）是必修课。`Cors` 会自动处理跨域请求并下发对应的响应头。如果当前请求是 `OPTIONS` 预检请求且没有命中特定路由，路由器会自动响应 `204 No Content` 放行。

通常将其注册为全局中间件使用：

```php
use Anon\Core\Http\Middleware\Cors;

Route::globalMiddleware(Cors::class);
```

> **注意：** 你可以通过继承该中间件并覆盖其 `$allowedOrigins` 等受保护属性来实现自定义的跨域策略。

### 请求限流中间件 (Throttle)

`Throttle` 配合缓存组件，可以对客户端请求进行频率限制，防止接口被恶意刷量。

```php
use Anon\Core\Http\Middleware\Throttle;

// 限制为：每 60 秒最多 60 次请求
Route::get('/api/data', function () {
    return 'Sensitive Data';
})->middleware(Throttle::class);
```

如果你想自定义频率，可以在继承后复写属性，或在后续版本支持中间件参数时传入。超限的请求会直接抛出 `429 Too Many Requests` HttpException。