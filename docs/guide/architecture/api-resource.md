# API 资源转换

接口返回数据时，最怕控制器里到处都是 `unset password`、`date()`、字段改名、分页拼装。写多了以后，响应结构会变得很散。

Resource 的作用就是把“业务数据长什么样”和“接口要返回什么样”分开。控制器负责拿数据，Resource 负责整理输出。

---

## 写一个资源类

继承 `Anon\Core\Http\Resource\Json`，然后在 `toArray()` 里描述最终要给前端的字段。

如果你想先生成一个骨架文件，也可以直接执行：

```bash
php anon make:resource UserResource
```

当前生成器会同时给出：

- `schema()`：用于 OpenAPI 响应结构声明
- `toArray()`：用于真正输出接口数据

这样 Resource 不只是“格式化层”，也可以直接成为 REST API 文档契约的一部分。

```php
namespace Anon\Http\Resources;

use Anon\Core\Http\Resource\Json;
use Anon\Core\Http\Request;

class UserResource extends Json
{
    public static function schema(): array
    {
        return [
            'type' => 'object',
            'required' => ['id', 'name', 'email', 'created_at'],
            'properties' => [
                'id' => ['type' => 'integer'],
                'name' => ['type' => 'string'],
                'email' => ['type' => 'string', 'format' => 'email'],
                'created_at' => ['type' => 'string'],
            ],
        ];
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
        ];
    }
}
```

`$this->id` 这类写法会从传进来的资源里取值。资源可以是对象，也可以是数组。

---

## 返回单个资源

控制器里不用关心响应细节，直接返回 Resource 即可。

```php
namespace Anon\Controller;

use Anon\Model\User;
use Anon\Http\Resources\UserResource;

class UserController
{
    public function show($id)
    {
        $user = User::find($id);

        return UserResource::make($user)
            ->meta(['loaded_at' => time()])
            ->links(['self' => '/users/' . $id]);
    }
}
```

最终会进入统一响应结构：

```json
{
  "success": true,
  "code": 200,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Anon"
  },
  "meta": {
    "loaded_at": 1710000000
  },
  "links": {
    "self": "/users/1"
  }
}
```

---

## 返回列表

列表接口用 `collection()`。

```php
namespace Anon\Controller;

use Anon\Model\User;
use Anon\Http\Resources\UserResource;

class UserController
{
    public function index()
    {
        $users = User::all();

        return UserResource::collection($users)
            ->meta(['source' => 'users'])
            ->links(['self' => '/users']);
    }
}
```

集合里的每一项都会用 `UserResource` 转换，最后放进响应的 `data`。

---

## 分页列表

推荐优先使用框架提供的 `Paginator`，这样分页信息会稳定放到 `meta.pagination`，分页链接会放到 `links`。

```php
use Anon\Core\Pagination\Paginator;

$paginator = Paginator::make(
    items: $users,
    total: 120,
    page: 1,
    perPage: 15,
    path: '/users'
);

return UserResource::collection($paginator);
```

输出大概是这样：

```json
{
  "success": true,
  "code": 200,
  "message": "OK",
  "data": [],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 120,
      "last_page": 8,
      "from": 1,
      "to": 15
    }
  },
  "links": {
    "first": "/users?page=1&per_page=15",
    "last": "/users?page=8&per_page=15",
    "prev": null,
    "next": "/users?page=2&per_page=15"
  }
}
```

如果你已经有自己的分页数组或分页对象，`Collection` 也会尽量识别常见字段，并自动整理到 `meta` 和 `links`。

能识别的数据列表字段：

- `data`
- `items`
- `records`

能识别的分页信息：

- `current_page`
- `page`
- `per_page`
- `limit`
- `total`
- `last_page`
- `from`
- `to`

能识别的分页链接：

- `first_page_url`
- `last_page_url`
- `prev_page_url`
- `next_page_url`

```php
return UserResource::collection([
    'data' => $users,
    'current_page' => 1,
    'per_page' => 15,
    'total' => 120,
    'last_page' => 8,
    'next_page_url' => '/users?page=2',
]);
```

输出大概是这样：

```json
{
  "success": true,
  "code": 200,
  "message": "OK",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 120,
    "last_page": 8
  },
  "links": {
    "next": "/users?page=2"
  }
}
```

如果你的分页结构比较特殊，也可以手动补：

```php
return UserResource::collection($users)
    ->meta(['total' => $total, 'page' => $page])
    ->links(['next' => $nextUrl]);
```

补充说明：

- 当前统一响应结构中的 `code` 已经是数字型 HTTP 状态码，不再使用早期示例里的 `"OK"` 字符串。
- 如果你的项目骨架使用的是 `Anon\...` 命名空间，就让 Resource、Controller、Model 跟着保持一致，不要混用 `App\...`。

---

## 和 OpenAPI 联动

如果你的 Resource 能稳定表达接口输出，推荐直接给它补一个静态 `schema()`，然后在路由上复用：

```php
use Anon\Controller\UserController;
use Anon\Core\Facade\Route;
use Anon\Http\Resources\UserResource;

Route::get('/users/{id}', [UserController::class, 'show'])
    ->summary('获取用户详情')
    ->resourceResponse(UserResource::class)
    ->errorResponse(404, '用户不存在', 'USER_NOT_FOUND');
```

如果是列表接口：

```php
Route::get('/users', [UserController::class, 'index'])
    ->summary('获取用户列表')
    ->resourceCollectionResponse(UserResource::class);
```

如果是分页列表：

```php
Route::get('/users', [UserController::class, 'index'])
    ->summary('获取分页用户列表')
    ->resourceCollectionResponse(UserResource::class, 'OK', 200, true);
```

这样生成 OpenAPI 时：

- `resourceResponse()` 会把 `data` 推导成单资源 schema
- `resourceCollectionResponse()` 会把 `data` 推导成资源数组
- 分页模式下会额外补 `meta.pagination` 和 `links`

这比在每个路由里重复写一整段 `successResponse([...])` 更适合中大型 REST API。
