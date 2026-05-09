# 路由系统

Anon Framework Next 提供了非常优雅且强大的路由系统，支持类似于 ThinkPHP8 的路由定义方式，包括基础路由、任意请求路由、路由组嵌套以及中间件绑定。

所有应用路由默认定义在 `app/route/main.php` 或 `app/route/` 目录下的其他 `.php` 文件中。框架启动时会自动加载该目录下的所有路由配置。

---

## 基础路由注册

使用 `Anon\Core\Facade\Route` 门面类来注册路由。支持 `GET`, `POST`, `PUT`, `DELETE` 等常见 HTTP 动作。

```php
use Anon\Core\Facade\Route;
use Anon\Core\Http\Request;
use Anon\Core\Http\Response;

// 响应 GET 请求
Route::get('/hello', function () {
    return 'Hello World';
});

// 响应 POST 请求
Route::post('/user/create', function (Request $request) {
    return ['status' => 'created'];
});
```

### 响应任意请求方法
如果你希望一个路由能响应所有的 HTTP 方法，可以使用 `any` 方法：

```php
Route::any('/ping', function () {
    return 'pong';
});
```

---

## 路由回调方式

路由的执行动作（Action）支持以下三种定义方式：

### 1. 闭包函数 (Closure)
直接在路由定义处编写逻辑，常用于简单的接口或测试。
```php
Route::get('/test', function(Request $request) {
    return 'This is a closure';
});
```

### 2. 数组控制器
推荐的方式，使用类常量引用，方便 IDE 追踪和跳转。
```php
use Anon\Controller\UserController;

Route::get('/user/info', [UserController::class, 'info']);
```

### 3. 字符串控制器
采用 `类名@方法名` 的格式。框架会自动补全 `Anon\Controller\` 命名空间前缀。
```php
Route::get('/user/list', 'UserController@list');
```

---

## 动态路由参数

路由系统支持通过 `{param}` 的方式定义动态参数。当路由匹配时，系统会自动提取这些参数。

```php
Route::get('/user/{id}', function ($id) {
    return 'User ID: ' . $id;
});

// 你也可以同时注入 Request 对象和路由参数
use Anon\Core\Http\Request;

Route::get('/post/{postId}/comment/{commentId}', function (Request $request, $postId, $commentId) {
    return "Post: {$postId}, Comment: {$commentId}";
});
```

动态参数同时也会被保存在 `Request` 对象中，你可以通过 `$request->route('id')` 获取：

```php
Route::get('/user/{id}', function (Request $request) {
    $id = $request->route('id');
    return 'User ID: ' . $id;
});
```

---

## 路由组 (Route Groups)

路由组允许你共享路由属性，例如公共的 URI 前缀，或者给整个组的路由绑定统一的中间件。组支持无限层级嵌套。

```php
Route::group('/api/v1', function ($route) {
    
    // 实际匹配: /api/v1/users
    $route->get('/users', function () {
        return ['user1', 'user2'];
    });

    // 嵌套子组
    $route->group('/admin', function ($route) {
        
        // 实际匹配: /api/v1/admin/dashboard
        $route->get('/dashboard', function () {
            return 'Admin Dashboard';
        });

    });
});
```

---

## 路由中间件 (Middleware)

你可以通过 `->middleware()` 方法将一个或多个中间件分配给路由或路由组。

### 给单个路由绑定中间件
```php
use Anon\Middleware\AuthMiddleware;

Route::get('/profile', function () {
    return 'Profile Page';
})->middleware(AuthMiddleware::class);
```

### 给路由组绑定中间件
路由组不仅支持传递 URI 前缀字符串，还可以通过数组方式传入 `prefix` 和 `middleware` 等属性。绑定在组上的中间件会作用于该组内的所有子路由。

```php
// 通过数组配置路由组属性
Route::group(['prefix' => '/admin', 'middleware' => AuthMiddleware::class], function ($route) {
    
    // 该路由会被 AuthMiddleware 拦截
    $route->get('/settings', function () {
        return 'Settings';
    });

});
```
