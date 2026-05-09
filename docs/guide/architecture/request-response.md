# 请求与响应

Anon Framework Next 是一个现代化的 RESTful API 框架。底层已经完全接管了 PHP 原生的 `$_GET`, `$_POST`, `echo` 等零散操作，统一封装成了 `Request` 和 `Response` 对象。

---

## Request 请求对象

`Anon\Core\Http\Request` 类负责捕获当前 HTTP 请求的环境信息，并提供简洁的 API 来获取输入数据。在路由闭包或控制器方法中，你可以通过参数注入的方式获取 `$request` 实例。

### 捕获输入数据

使用 `$request->input()` 方法是获取前端参数的最佳实践。该方法会自动从 `GET` 参数、`POST` 表单、以及前端传递的 `application/json` Body 中提取对应字段的数据。

```php
use Anon\Core\Http\Request;

Route::post('/user/update', function (Request $request) {
    // 自动从查询字符串或 JSON Body 中获取 username 参数
    $username = $request->input('username');
    
    // 支持设置默认值
    $age = $request->input('age', 18);
    
    return ['username' => $username, 'age' => $age];
});
```

### 获取请求基础信息

你可以方便地获取请求的类型、URI 以及请求头。

```php
Route::get('/test', function (Request $request) {
    $method = $request->method(); // 例如: GET, POST
    $uri = $request->uri();       // 例如: /user/info
    
    // 访问原始 HTTP Header 数组
    $headers = $request->header;
    
    return compact('method', 'uri');
});
```

### 获取路由参数

如果在路由定义中使用了动态参数（例如 `/user/{id}`），可以通过 `route` 方法获取：

```php
// 获取单个路由参数
$id = $request->route('id');

// 获取所有路由参数
$params = $request->route();
```

### 获取请求头与 Cookie

```php
// 获取请求头 (不区分大小写)
$token = $request->header('Authorization');

// 获取 Bearer Token
$token = $request->bearerToken();

// 获取 Cookie
$sessionId = $request->cookie('PHPSESSID');
```

### 获取上传的文件

使用 `file` 方法可以获取客户端上传的文件。该方法会返回 `Anon\Core\Http\UploadedFile` 的对象实例，让你可以优雅地处理文件：

```php
// 获取名为 'avatar' 的上传文件
$file = $request->file('avatar');

if ($file && $file->isValid()) {
    // 获取文件的原始名和扩展名
    $name = $file->getClientOriginalName();
    $extension = $file->getClientOriginalExtension();
    
    // 将文件移动到指定目录 (框架会自动处理重命名等安全问题)
    $path = $file->move(BASE_PATH . '/run/storage/avatars');
    
    echo "文件已保存至: " . $path;
}
```

框架还提供了一个快捷方法来检查请求中是否包含有效的文件：

```php
if ($request->hasFile('avatar')) {
    // 文件存在且上传有效
}
```

---

## Response 响应对象

因为我们是 API 框架，因此 `Anon\Core\Http\Response` 默认会将所有的输出内容转换为 JSON 格式，并自动附带 `Content-Type: application/json; charset=utf-8` 头信息。

### 基础 JSON 输出

在路由或控制器中，你**不需要**手动创建 Response 对象。只要你 `return` 了一个数组或对象，底层路由系统会自动将其转换为 Response JSON 输出。

```php
// 直接返回数组，框架会自动帮你转换为 JSON 响应
Route::get('/list', function () {
    return [
        ['id' => 1, 'name' => 'Alice'],
        ['id' => 2, 'name' => 'Bob']
    ];
});
```

### 标准化 RESTful 响应

为了统一团队的 API 输出规范，Response 类提供了 `success` 和 `error` 静态工厂方法。

#### 1. 成功响应
```php
use Anon\Core\Http\Response;

Route::get('/user/profile', function () {
    $user = ['id' => 100, 'name' => 'Anon'];
    
    // 默认输出: {"code":200, "message":"success", "data":{"id":100...}}
    return Response::success($user);
    
    // 也可以自定义成功消息
    // return Response::success($user, '获取成功');
});
```

#### 2. 失败/异常响应
```php
use Anon\Core\Http\Response;

Route::post('/user/pay', function (Request $request) {
    $amount = $request->input('amount');
    
    if ($amount < 0) {
        // 默认输出: {"code":400, "message":"金额不能为负数", "data":null}
        return Response::error('金额不能为负数', 400);
    }
    
    return Response::success(null, '支付成功');
});
```

### 自定义 HTTP 状态码与头信息

如果你需要手动操控 HTTP 头或非默认的状态码，可以链式调用对应的方法：

```php
use Anon\Core\Http\Response;

Route::get('/custom', function () {
    return Response::json(['status' => 'ok'])
        ->setStatusCode(201)
        ->setHeader('X-Custom-Header', 'AnonFramework');
});
```