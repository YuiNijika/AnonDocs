# OpenAPI 生成

接口多了以后，最麻烦的不是写接口，而是让前端、测试和调试工具知道“现在到底有哪些接口”。

Anon 可以直接从已经注册的路由里生成一份 OpenAPI JSON。它不会替你脑补业务含义，但能把路径、方法、路径参数和你在路由上补充的说明整理出来。

---

## 给路由补一点说明

如果只是普通路由，也能生成文档；但文档会比较干。建议在对外接口上顺手补上这些信息：

```php
use Anon\Core\Facade\Route;
use Anon\Controller\UserController;

Route::get('/users/{id}', [UserController::class, 'show'])
    ->name('users.show')
    ->summary('获取用户详情')
    ->description('根据用户 ID 返回用户基础资料')
    ->tags(['Users'])
    ->pathParam('id', 'integer', '用户 ID', 1)
    ->queryParam('include', 'string', false, '附带加载的关联数据', 'roles,permissions')
    ->security('bearerAuth')
    ->successResponse([
        'id' => 'integer|required',
        'name' => 'string|required',
        'email' => 'string|required',
        'age' => 'integer',
    ])
    ->errorResponse(404, '用户不存在', 'USER_NOT_FOUND');
```

这几个方法的作用很直接：

| 方法 | 用来做什么 |
|---|---|
| `name()` | 给路由取名，也会作为默认 `operationId` |
| `summary()` | 一句话说明这个接口干什么 |
| `description()` | 需要更详细时再写，不必每个接口都长篇说明 |
| `tags()` | 给接口分组，比如 `Users`、`Orders` |
| `schema()` | 用简写方式声明 JSON 请求体字段 |
| `queryParam()` / `pathParam()` / `headerParam()` / `cookieParam()` | 声明 REST API 参数 |
| `successResponse()` / `errorResponse()` | 基于框架统一响应契约声明返回结构 |
| `resourceResponse()` / `resourceCollectionResponse()` | 基于 Resource 类声明单资源或列表响应 |
| `security()` | 声明 OpenAPI 安全方案，例如 `bearerAuth` |
| `deprecated()` | 标记接口已废弃 |
| `openapi()` | 直接合并一段 OpenAPI operation 配置 |

如果你没有手写 `pathParam()`，生成器现在也会对常见 REST path 参数做一层轻量兜底：

- 优先读取控制器方法里的标量参数类型，例如 `int $id`、`string $slug`
- 如果路由用了 `Route::model()`，会继续参考绑定键
- `id` / `*_id` 默认更偏向 `integer`
- `uuid` / `*_uuid` 会推成 `string` 且带 `uuid` 格式

这层自动推导只是为了让默认文档更接近真实接口，显式声明的 `pathParam()` 仍然优先。

---

## 生成文档

在项目根目录执行：

```bash
php anon openapi:generate
```

默认会生成到：

```text
runtime/openapi.json
```

如果你想放到别的位置：

```bash
php anon openapi:generate --output=runtime/docs/openapi.json
```

如果你只想把结果直接输出到终端，方便管道到其他工具：

```bash
php anon openapi:generate --stdout
```

如果你希望在开发或提交前做一次轻量校验：

```bash
php anon openapi:generate --check
```

如果要给 CI 或自定义工具做结构化读取：

```bash
php anon openapi:generate --check --json
```

`--check` 当前会重点提示两类最常见的问题：

- 路由或 Action 缺少 `summary()`
- 路由仍然只有默认 `200` 响应，Action 还没有显式补响应元信息
- 路径参数既没有显式 `pathParam()`，又无法从控制器参数类型或 `Route::model()` 绑定里推导

`--check --json` 当前会输出：

- `status`
- `summary`
- `issue_count`
- `issues`
- `routes`
- `actions`

其中：

- `issues` 仍然是兼容旧脚本的扁平数组
- `routes` 会按路由分组返回问题
- `actions` 会按 Action 分组返回问题
- 分组项里也会带 `source`
- 分组项里也会带 `status`，当前为 `warning`
- 分组项里也会带 `issues_detail`，便于直接消费问题代码与字段信息
- `summary` 会给出 routes/actions 各自的命中数量和总 issue 数

如果你需要更紧凑的 JSON，也可以关闭 pretty print：

```bash
php anon openapi:generate --stdout --no-pretty
```

---

## 指定 OpenAPI 版本

默认生成的文档顶部声明的是 OpenAPI 3.0.3。如果你需要输出 3.1.x 规范的文档（例如为了更好地配合 Swagger UI 5.x 或某些代码生成器），在 `anon.config.php` 中配置即可：

```php
// anon.config.php
return Config::define([
    // ...
    'openapi' => [
        'version' => '3.1.0',   // 可选: '3.0.3', '3.1.0', '3.1.1' …
    ],
]);
```

规则：

- 只允许 `3.0.x` 和 `3.1.x` 系列版本号（正则 `/^3\.[01]\.\d+$/`）
- 非法值会静默退回默认 `3.0.3`
- 不传此配置项或留空也使用默认 `3.0.3`

注意：切换版本号只影响文档顶部的 `openapi` 字段声明，Generator 内部的 schema 生成逻辑目前保持与 3.0.x 兼容，尚未实现 3.1.x 独有的 `jsonSchemaDialect`、路径级 `summary`/`description`、`webhooks` 等完整特性。如果你在路由上手动通过 `openapi()` 传入了 3.1 特有结构，请确保版本号已同步设置为 `3.1.x`，否则校验工具可能报 schema 不匹配。

```bash
# 配置后记得清理 config 缓存，确保变更生效
php anon config:clear
```

---

## 当前会生成哪些内容

目前生成的是一份“够用、可继续扩展”的 OpenAPI 文档，包含：

- OpenAPI 版本
- 应用名称和框架版本
- 路径与 HTTP 方法
- `{id}` 这类路径参数
- 手动声明的 query/header/cookie/path 参数
- `operationId`
- `summary`、`description`、`tags`
- `deprecated`
- `security`
- Server Actions 的调用入口
- 基础 `responses`
- 通过 `openapi()` 追加的自定义片段

也就是说，你可以先用它打通 Swagger、Apifox、Postman 这类工具链；常见 REST API 的参数、鉴权、成功/失败响应，现在可以直接用路由 helper 声明，更细的 request body 和复杂 schema 再通过 `openapi()` 慢慢补。

---

## FormRequest 自动推导

如果路由对应的控制器方法注入了 `FormRequest`，而你又没有手动写 `schema()` 或自定义 `requestBody`，生成器会尝试自动从 `rules()` 推导输入结构。

例如：

```php
namespace Anon\Http\Requests;

use Anon\Core\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'username' => 'required|min:4|max:20',
            'email' => 'required|email',
            'age' => 'integer|min:0',
            'status' => 'in:active,disabled',
        ];
    }
}
```

```php
Route::post('/users', [UserController::class, 'store'])
    ->summary('创建用户')
    ->successResponse([
        'id' => 'integer|required',
        'username' => 'string|required',
        'email' => 'string|required',
    ], 'Created', 201);
```

这种情况下：

- `POST`、`PUT`、`PATCH` 会自动生成 `requestBody`
- `GET`、`DELETE`、`HEAD` 会自动生成 query 参数

当前自动推导会识别常见规则：

- `required`
- `email`
- `integer` / `numeric` / `boolean`
- `array` / `object`
- `min` / `max`
- `in`

如果你已经显式写了 `schema()`、参数 helper 或 `openapi()`，则以你手写的声明为准。

---

## 统一响应契约

当前生成器内置了两个组件 schema：

- `#/components/schemas/ApiSuccess`
- `#/components/schemas/ApiError`

它们和框架当前真实响应约定保持一致：

- `code` 是数字型 HTTP 状态码，不是字符串 `"OK"`
- 业务失败标识放在 `error_code`
- 成功时可选 `business_code`

所以更推荐这样写：

```php
Route::post('/users', [UserController::class, 'store'])
    ->summary('创建用户')
    ->schema([
        'name' => 'string|required',
        'email' => 'string|required',
    ])
    ->successResponse([
        'id' => 'integer|required',
        'name' => 'string|required',
        'email' => 'string|required',
    ], 'Created', 201)
    ->errorResponse(400, '缺少参数', 'BAD_REQUEST')
    ->errorResponse(422, '验证失败', 'VALIDATION_FAILED', [
        'type' => 'object',
        'additionalProperties' => true,
    ]);
```

这样生成出来的文档会更接近框架的实际响应，而不是停留在“只有 200 OK 文本描述”的阶段。

---

## 安全方案

当前生成器默认内置两种常见安全方案：

- `bearerAuth`
- `apiKeyAuth`

你可以直接在路由上声明：

```php
Route::get('/profile', [ProfileController::class, 'show'])
    ->security('bearerAuth');
```

也可以一次声明多个：

```php
Route::get('/internal/stats', [StatsController::class, 'index'])
    ->security(['apiKeyAuth'])
    ->deprecated();
```

如果某些接口需要更复杂的 scope 或组合条件，再用 `openapi()` 继续覆盖即可。

---

## Resource 响应复用

如果你的接口已经使用 `Json Resource` 统一输出，推荐直接让路由复用 Resource 的 schema，而不是再手写一份响应字段：

```php
namespace Anon\Http\Resources;

use Anon\Core\Http\Request;
use Anon\Core\Http\Resource\Json;

class UserResource extends Json
{
    public static function schema(): array
    {
        return [
            'type' => 'object',
            'required' => ['id', 'name', 'email'],
            'properties' => [
                'id' => ['type' => 'integer'],
                'name' => ['type' => 'string'],
                'email' => ['type' => 'string', 'format' => 'email'],
            ],
        ];
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }
}
```

```php
Route::get('/users/{id}', [UserController::class, 'show'])
    ->resourceResponse(UserResource::class)
    ->errorResponse(404, '用户不存在', 'USER_NOT_FOUND');

Route::get('/users', [UserController::class, 'index'])
    ->resourceCollectionResponse(UserResource::class);

Route::get('/users/paged', [UserController::class, 'paged'])
    ->resourceCollectionResponse(UserResource::class, 'OK', 200, true);
```

适用场景：

- 单条资源详情
- 普通列表
- 分页列表

如果 Resource 没有覆盖静态 `schema()`，生成器会退回到一个保守的通用 object schema。

---

## Server Actions 也会进去

如果你注册了 Server Action：

```php
use Anon\Action\PublishPost;
use Anon\Core\Facade\Action;

Action::post('posts.publish', PublishPost::class)
    ->summary('发布文章')
    ->description('把草稿文章切换为发布状态')
    ->tags(['Posts']);
```

生成出来会多一个路径：

```text
POST /_actions/posts.publish
```

默认会给它一个基础 JSON 请求体，并带上常见错误响应：`401`、`403`、`419`、`422`、`429`。如果你想把字段写细一点，可以继续用 `openapi()` 追加：

```php
Action::post('posts.publish', PublishPost::class)
    ->openapi([
        'requestBody' => [
            'content' => [
                'application/json' => [
                    'schema' => [
                        'type' => 'object',
                        'required' => ['id'],
                        'properties' => [
                            'id' => ['type' => 'integer'],
                        ],
                    ],
                ],
            ],
        ],
        'responses' => [
            '200' => ['description' => 'OK'],
            '401' => ['description' => 'Unauthorized.'],
            '403' => ['description' => 'Forbidden.'],
            '419' => ['description' => 'CSRF token mismatch.'],
            '422' => ['description' => 'Validation failed.'],
            '429' => ['description' => 'Too Many Requests.'],
        ],
    ]);
```

如果你不想每次都手写完整 `openapi()` 数组，现在也可以直接在 Action 注册上补：

```php
use Anon\Http\Resources\PostResource;

Action::post('posts.publish', PublishPost::class)
    ->schema([
        'id' => 'integer|required',
    ])
    ->security('bearerAuth')
    ->resourceResponse(PostResource::class)
    ->errorResponse(404, '文章不存在', 'POST_NOT_FOUND');
```

Action 侧常用 helper 现在包括：

- `successResponse()`
- `errorResponse()`
- `resourceResponse()`
- `resourceCollectionResponse()`
- `security()`
- `deprecated()`
