# 路由系统

Anon Framework Next 提供路由系统，支持基础路由、任意请求路由、路由组嵌套以及中间件绑定。

所有应用路由默认定义在 `app/Route/Main.php` 或 `app/Route/` 目录下的其他 `.php` 文件中。框架启动时会自动加载该目录下的所有路由配置。

在 Linux 环境下，目录大小写必须与命名空间和框架约定保持一致。推荐统一使用大写目录名，例如 `Controller`、`Service`、`Route`、`Action`，避免 Windows 本地正常而线上找不到类。

---

## 从 Skeleton 开始

默认 `skeleton` 会刻意保持简洁，只保留少量最基础的示例路由。更完整的开发示例建议直接参考本文档，而不是继续把大量 demo 堆回骨架目录。

通常你只需要改两个文件：

- `app/Route/Main.php`
- `app/Controller/YourController.php`

下面是一套最小开发示例。

### 1. 创建控制器

你可以按两种风格组织控制器：

- 单文件控制器：`php anon make:controller User`
- 目录式控制器：`php anon make:controller Admin/User --group`

例如新建 `app/Controller/Admin/User/Index.php`：

```php
<?php

namespace Anon\Controller\Admin\User;

use Anon\Core\Http\Request;
use Anon\Core\Http\Response;

class Index
{
    public function index(): Response
    {
        return Response::success([
            ['id' => 1, 'name' => 'Alice'],
            ['id' => 2, 'name' => 'Bob'],
        ], 'User List');
    }

    public function show(Request $request, string $id): Response
    {
        return Response::success([
            'id' => $id,
            'route_id' => $request->route('id'),
        ], 'User Detail');
    }
}
```

### 2. 在路由文件中注册控制器

在 `app/Route/Main.php` 中注册：

```php
<?php

use Anon\Core\Facade\Route;
use Anon\Controller\Admin\User\Index;

Route::get('/admin/users', [Index::class, 'index']);
Route::get('/admin/users/{id}', [Index::class, 'show']);
```

这样就是一个非常接近 ThinkPHP 初始化体验的最小开发流：

1. 建控制器
2. 配路由
3. 开始写业务

---

## 基础路由注册

使用 `Anon\Core\Facade\Route` 门面类来注册路由。支持 `GET`, `POST`, `PUT`, `PATCH`, `DELETE` 等 HTTP 动作。

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

### 控制器路由示例

实际项目中，更推荐优先使用控制器动作，而不是把大量业务逻辑直接写在闭包里：

```php
use Anon\Core\Facade\Route;
use Anon\Controller\Admin\User\Index;

Route::get('/admin/users', [Index::class, 'index']);
Route::post('/admin/users', [Index::class, 'store']);
Route::patch('/admin/users/{id}', [Index::class, 'update']);
```

### 资源路由示例

如果你的控制器本身就是标准 CRUD 结构，可以直接使用资源路由：

```php
use Anon\Core\Facade\Route;
use Anon\Controller\Admin\User\Index;

Route::resource('/admin/users', Index::class);
```

它会自动注册：

- `GET /admin/users` -> `index`
- `GET /admin/users/{id}` -> `show`
- `POST /admin/users` -> `store`
- `PUT /admin/users/{id}` -> `update`
- `PATCH /admin/users/{id}` -> `update`
- `DELETE /admin/users/{id}` -> `delete`

如果你更习惯字符串控制器，也可以这样写：

```php
Route::resource('/admin/users', 'Admin/User/Index');
```

也支持精简资源路由：

```php
Route::resource('/admin/users', 'Admin/User/Index', [
    'only' => ['index', 'show'],
]);
```

或排除部分动作：

```php
Route::resource('/admin/users', 'Admin/User/Index', [
    'except' => ['delete'],
]);
```

如果你的资源主键参数名不是 `id`，也可以自定义：

```php
Route::resource('/admin/users', 'Admin/User/Index', [
    'param' => 'userId',
]);
```

### 响应任意请求方法
使用 `any` 方法响应所有的 HTTP 方法：

```php
Route::any('/ping', function () {
    return 'pong';
});
```

---

## 路由回调方式

路由的执行动作支持以下三种定义方式：

### 1. 闭包函数 (Closure)
直接在路由定义处编写逻辑。
```php
Route::get('/test', function(Request $request) {
    return 'This is a closure';
});
```

### 2. 数组控制器
使用类常量引用。
```php
use Anon\Controller\Admin\User\Index;

Route::get('/admin/user/info', [Index::class, 'info']);
```

### 3. 字符串控制器
采用 `类名@方法名` 的格式。框架会自动补全默认控制器命名空间前缀，并支持多级目录风格。
```php
Route::get('/admin/users', 'Admin/User/Index@index');
```

---

## 动态路由参数

支持通过 `{param}` 的方式定义动态参数。当路由匹配时，系统会自动提取这些参数。

### 最基础的静态路由

```php
Route::get('/ping', function () {
    return 'pong';
});

Route::get('/articles', [ArticleController::class, 'index']);
```

### 最基础的动态路由

```php
Route::get('/hello/{name}', function ($name) {
    return 'Hello ' . $name;
});

Route::get('/articles/{id}', [ArticleController::class, 'show']);
```

```php
Route::get('/user/{id}', function ($id) {
    return 'User ID: ' . $id;
});

// 同时注入 Request 对象和路由参数
use Anon\Core\Http\Request;

Route::get('/post/{postId}/comment/{commentId}', function (Request $request, $postId, $commentId) {
    return "Post: {$postId}, Comment: {$commentId}";
});
```

动态参数会被保存在 `Request` 对象中，可以通过 `$request->route('id')` 获取：

```php
Route::get('/user/{id}', function (Request $request) {
    $id = $request->route('id');
    return 'User ID: ' . $id;
});
```

控制器中同样可以直接接收动态参数：

```php
class ArticleController
{
    public function show(Request $request, string $id): Response
    {
        return Response::success([
            'id' => $id,
            'route_id' => $request->route('id'),
        ]);
    }
}
```

### API 版本分组

如果接口需要版本化，可以用 `version()` 做一层语义更清楚的分组：

```php
use Anon\Core\Facade\Route;
use Anon\Controller\Api\UserController;

Route::version('v1')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
});
```

实际注册出来的路径是：

```http
GET /api/v1/users
GET /api/v1/users/{id}
```

如果你的 API 前缀不是 `/api`，可以传第二个参数：

```php
Route::version('v2', '/open')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});
```

对应路径是：

```http
GET /open/v2/users
```

### 路由参数绑定

简单参数继续用字符串就够了。如果你希望在进入控制器前先把参数解析成业务对象，可以显式绑定：

```php
Route::bind('user', function ($value) {
    return User::find($value);
});

Route::get('/users/{user}', [UserController::class, 'show']);
```

控制器里参数名保持一致即可拿到绑定结果：

```php
class UserController
{
    public function show($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }
}
```

如果模型类有 `find()`、`findBy()` 或 `where()->first()` 这类入口，也可以用更短的模型绑定：

```php
Route::model('user', User::class);
Route::get('/users/{user}', [UserController::class, 'show']);
```

当绑定结果为空时，框架会返回统一的 `NOT_FOUND`。如果控制器参数同时带了类型，并且路由绑定结果就是这个类型，框架会优先把绑定结果注入进去。

如果后面要生成 OpenAPI，而你又没有手写 `pathParam()`，生成器还会把这类信息当作兜底线索：

- 控制器参数如果声明成 `int $id`、`string $slug`，会优先按标量类型推导 path schema
- `Route::model('user', User::class)` 默认按绑定键推导；键是 `id` / `*_id` 时会优先推成 `integer`
- 键是 `uuid` / `*_uuid` 时会推成 `string + uuid format`

如果你需要更精确的描述、示例值或想覆盖默认推导，仍然建议显式写 `pathParam()`。


---

## 路由组 (Route Groups)

路由组允许共享路由属性，例如公共的 URI 前缀，或者绑定统一的中间件。框架**支持任意深度的路由组嵌套**，使用独立的栈结构管理状态。

```php
Route::group('/api/v1', function ($route) {
    
    // 匹配: /api/v1/users
    $route->get('/users', function () {
        return ['user1', 'user2'];
    });

    // 嵌套子组：前缀和中间件会自动与上级组叠加
    $route->group(['prefix' => '/admin', 'middleware' => AdminAuthMiddleware::class], function ($route) {
        
        // 匹配: /api/v1/admin/dashboard
        $route->get('/dashboard', function () {
            return 'Admin Dashboard';
        });

        // 任意深度的第三层嵌套
        $route->group(['prefix' => '/settings', 'middleware' => SettingsMiddleware::class], function ($route) {
            
            // 匹配: /api/v1/admin/settings/system
            // 执行顺序: Global -> AdminAuthMiddleware -> SettingsMiddleware
            $route->get('/system', function () {
                return 'System Settings';
            });
            
        });
    });
});
```

---

## 路由中间件 (Middleware)

通过 `->middleware()` 方法将中间件分配给路由或路由组。

### 给单个路由绑定中间件
```php
use Anon\Middleware\AuthMiddleware;

Route::get('/profile', function () {
    return 'Profile Page';
})->middleware(AuthMiddleware::class);
```

### 给路由组绑定中间件
路由组支持通过数组方式传入 `prefix` 和 `middleware` 属性。绑定在组上的中间件会作用于该组内的所有子路由。

```php
// 通过数组配置路由组属性
Route::group(['prefix' => '/admin', 'middleware' => AuthMiddleware::class], function ($route) {
    
    // 该路由会被 AuthMiddleware 拦截
    $route->get('/settings', function () {
        return 'Settings';
    });

});
```

---

## 路由元信息

如果后面要生成 OpenAPI，或者只是想让路由列表更容易看懂，可以给路由补一些元信息。

```php
Route::get('/users/{id}', [UserController::class, 'show'])
    ->name('users.show')
    ->summary('获取用户详情')
    ->description('根据用户 ID 返回用户基础资料')
    ->tags(['Users'])
    ->openapi([
        'responses' => [
            '200' => ['description' => 'User detail'],
            '404' => ['description' => 'User not found'],
        ],
    ]);
```

常用的就这几个：

- `name()`：路由名，也会作为默认 `operationId`
- `summary()`：一句话说明接口用途
- `description()`：更详细的接口说明
- `tags()`：接口分组
- `openapi()`：直接追加 OpenAPI operation 配置

这些信息会跟着路由缓存一起保存，不需要每次启动重新计算。

如果你当前项目是标准 REST API，还可以直接在路由上补参数、响应和鉴权声明：

```php
Route::get('/users/{id}', [UserController::class, 'show'])
    ->name('users.show')
    ->summary('获取用户详情')
    ->tags(['Users'])
    ->pathParam('id', 'integer', '用户 ID', 1)
    ->queryParam('include', 'string', false, '附带加载的关联数据', 'roles,permissions')
    ->security('bearerAuth')
    ->successResponse([
        'id' => 'integer|required',
        'name' => 'string|required',
        'email' => 'string',
    ])
    ->errorResponse(404, '用户不存在', 'USER_NOT_FOUND');
```

这样做的好处是：

- 路由定义和 OpenAPI 元数据放在一起
- 不需要每个接口都手写完整 `openapi()` 数组
- 更贴近 REST API 的路径参数、查询参数、标准成功/失败响应模型

### REST API 常用 helper

除了 `openapi()` 直接透传原始配置以外，路由还支持以下 helper：

| 方法 | 用来做什么 |
|---|---|
| `parameter()` | 手动声明任意位置参数 |
| `queryParam()` | 声明 query 参数 |
| `pathParam()` | 声明 path 参数 |
| `headerParam()` | 声明 header 参数 |
| `cookieParam()` | 声明 cookie 参数 |
| `response()` | 自定义某个 HTTP 响应 |
| `successResponse()` | 基于统一 `ApiSuccess` 契约声明成功响应 |
| `errorResponse()` | 基于统一 `ApiError` 契约声明失败响应 |
| `resourceResponse()` | 基于 Resource 类声明单资源响应 |
| `resourceCollectionResponse()` | 基于 Resource 类声明列表或分页列表响应 |
| `security()` | 声明 OpenAPI 安全方案，例如 `bearerAuth` |
| `deprecated()` | 标记当前接口是否已废弃 |
| `responseHeader()` / `responseHeaders()` | 直接声明路由返回时要追加的响应头 |
| `allowHeaders()` / `exposeHeaders()` | 声明该路由的 CORS 请求头白名单和暴露头 |
| `allowOrigin()` / `allowMethods()` | 声明该路由允许的来源和方法 |
| `allowCredentials()` / `maxAge()` | 声明是否允许携带凭证、预检缓存时间 |
| `cors()` | 一次性批量声明整组路由级 CORS 规则 |

如果 helper 不够表达复杂场景，再继续用 `openapi()` 叠加更细的配置即可。

### 路由级 Header / CORS

如果你希望某几个接口显式控制响应头、预检行为或跨域策略，可以直接在路由注册时声明，而不必再去 `Hook.php` 里做全局兜底。

```php
Route::get('/admin/profile', [ProfileController::class, 'show'])
    ->summary('获取后台用户资料')
    ->responseHeader('X-Route-Scope', 'admin')
    ->allowOrigin([
        'https://admin.example.com',
        'https://ops.example.com',
    ])
    ->allowHeaders(['Authorization', 'Content-Type', 'X-Trace-Id'])
    ->exposeHeaders(['X-Trace-Id'])
    ->allowMethods(['GET'])
    ->allowCredentials()
    ->maxAge(600);
```

也可以用 `cors()` 一次性批量配置：

```php
Route::post('/uploads', [UploadController::class, 'store'])
    ->responseHeaders([
        'X-Upload-Endpoint' => 'media',
        'Cache-Control' => 'no-store',
    ])
    ->cors([
        'origin' => ['https://admin.example.com'],
        'allow_headers' => ['Authorization', 'Content-Type'],
        'expose_headers' => ['X-Request-Id'],
        'methods' => ['POST'],
        'credentials' => true,
        'max_age' => 300,
    ]);
```

如果你想给整组接口统一挂上同一套 Header/CORS 规则，也可以先链式声明，再进入 `group()`：

```php
Route::allowOrigin(['https://admin.example.com'])
    ->allowHeaders(['Authorization', 'Content-Type'])
    ->allowCredentials()
    ->maxAge(600)
    ->group('/admin', function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile', [ProfileController::class, 'update']);
    });
```

这套路由级声明会在运行时自动生效：

- 普通成功响应会追加对应的自定义响应头和 CORS 响应头
- 该路由抛出异常时，异常响应也会套用同一组路由级 header/CORS 规则
- 未显式注册 `OPTIONS` 路由时，框架会尝试按目标路由自动返回 `204` 预检响应
- 路由缓存会一并持久化这些元数据，重新加载后仍然有效

---

## OpenAPI 生成

路由注册好以后，可以直接生成 OpenAPI JSON：

```bash
php anon openapi:generate
```

默认生成到：

```text
runtime/openapi.json
```

也可以指定输出路径：

```bash
php anon openapi:generate --output=runtime/docs/openapi.json
```

如果你只是想先预览内容，不想落盘：

```bash
php anon openapi:generate --stdout
```

如果你希望在提交前做一次轻量检查，确认哪些接口还缺少基础文档元信息：

```bash
php anon openapi:generate --check
```

如果你要把检查结果直接交给 CI 或脚本处理：

```bash
php anon openapi:generate --check --json
```

当前检查会重点提示这些真实项目里最常见的问题：

- 缺少 `summary()`
- 仍然只有默认 `200` 响应，没有补 `successResponse()` / `errorResponse()` / `resourceResponse()`
- 路径参数没有显式 `pathParam()`，同时也无法从控制器参数类型或 `Route::model()` 绑定可靠推导

`--check --json` 会输出统一结构：

- `status`
- `summary`
- `issue_count`
- `issues`
- `routes`
- `actions`

其中：

- `issues` 保留扁平数组，便于兼容已有脚本
- `routes` 更适合渲染路由巡检报表
- `actions` 更适合渲染 Action 巡检报表
- 分组项里也会带 `source`
- 分组项里也会带 `status`，当前为 `warning`
- 分组项里也会带 `issues_detail`
- `summary` 会给出 routes/actions 各自的命中数量和总 issue 数

如果你要把输出接到其他工具，而不希望有额外缩进，也可以关闭 pretty print：

```bash
php anon openapi:generate --stdout --no-pretty
```

目前会生成路径、HTTP 方法、路径参数、`operationId`、`summary`、`description`、`tags` 和基础响应声明。更细的 schema 可以通过 `openapi()` 自己补。

对于常见 REST 资源路由，路径参数现在会优先按下面的顺序推导：

- 你显式写的 `pathParam()`
- 控制器方法里的标量参数类型
- `Route::model()` 绑定键，例如 `id`、`uuid`

也就是说，像 `GET /users/{id}` 这类接口，即使没手写 `pathParam('id', 'integer')`，文档通常也能得到更接近真实场景的 schema；但如果接口是 UUID、slug 或带示例值，依然推荐手写声明。

---

## 路由列表

想确认当前项目到底注册了哪些路由，直接跑：

```bash
php anon route:list
```

现在除了 `Method`、`URI`、`Action`、`Middleware`，也会额外显示 `Name`、`Summary` 和一个很短的 `Docs` 摘要，适合快速确认哪些接口的文档元信息还比较薄。

如果你想交给脚本或 CI 读取：

```bash
php anon route:list --json
```

JSON 输出会包含这些字段：

- `method`
- `uri`
- `name`
- `action`
- `middlewares`
- `summary`
- `description`
- `tags`
- `security`
- `deprecated`
- `response_headers`
- `cors`
- `source`
- `status`
- `issues`
- `issues_detail`
- `issue_count`

其中：

- `issues` 会列出和 `openapi:generate --check` 同一套轻量问题摘要
- `issues_detail` 会返回结构化问题详情，适合 CI 或报表系统直接消费
- `issue_count` 适合脚本、CI 或你自己的巡检工具快速判断优先级
- `source` 当前固定为 `route`
- `status` 当前只有两种：`ok` 和 `warning`
- `response_headers` / `cors` 会返回当前路由最终声明出来的响应头和 CORS 元数据

这在做接口巡检、文档校验或自定义工具链时会比纯表格更方便。

---

## 路由派发与反射缓存

框架对路由派发进行了性能优化：

1. **精准命中 O(1) 复杂度**：对于静态路由，路由器采用直接的哈希表寻址（`isset`），时间复杂度为 `O(1)`。
2. **中间件实例单例化**：在执行洋葱模型时，会将实例化的中间件缓存在内存池中。
3. **控制器反射缓存 (Reflection Cache)**：当路由指向控制器方法时，框架会对控制器的 `ReflectionMethod` 进行单例缓存。

---

## 路由缓存

生产环境可以将可缓存的路由定义写入 `runtime/cache/routes.php`：

```bash
php anon route:cache
php anon route:clear
```

应用启动时若存在路由缓存，会优先直接装载缓存内容，而不是重新遍历 `app/Route/*.php`。

当前路由缓存采用安全模式：

- 支持字符串控制器动作，例如 `Admin/User/Index@index`
- 支持数组控制器动作，例如 `[Index::class, 'index']`
- 不支持闭包路由；执行 `route:cache` 时遇到闭包会直接报错

当你修改以下内容后，应重新执行 `php anon route:cache`：

- `app/Route/*.php`
- 控制器类名或方法名
- 路由中间件字符串定义

推荐在发布时先清理旧缓存，再重新构建：

```bash
php anon route:clear
php anon route:cache
```

如果你需要临时禁用路由缓存，可以设置：

```env
ANON_DISABLE_ROUTE_CACHE=true
```
