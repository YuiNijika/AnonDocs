# API 资源层 (API Resources)

在构建 API 时，通常需要一个转换层，将复杂的 Model 数据或数据库查询结果转换为符合特定格式的 JSON 数组。Anon Framework Next 提供了 `Json` 资源和 `Collection` 资源集合类，帮助你优雅地构建结构统一的响应。

---

## 创建资源类

你可以继承 `Anon\Core\Http\Resource\Json` 类来创建你自己的资源类。

```php
namespace App\Http\Resources;

use Anon\Core\Http\Resource\Json;
use Anon\Core\Http\Request;

class UserResource extends Json
{
    /**
     * 将资源转换成数组
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            // 隐藏 password
            'created_at' => date('Y-m-d H:i:s', $this->created_at),
        ];
    }
}
```

> **注意：** 在 `toArray` 方法中，你可以直接通过 `$this->属性名` 访问基础 Model 上的属性。

---

## 响应单个资源

在控制器中，你可以使用 `make` 方法实例化资源并直接返回，框架的路由会自动将其解析为 JSON 响应。

```php
namespace App\Controller;

use App\Model\User;
use App\Http\Resources\UserResource;

class UserController
{
    public function show($id)
    {
        $user = User::find($id);
        
        return UserResource::make($user);
    }
}
```

---

## 响应资源集合

如果你要返回多条记录（例如列表页），可以使用 `collection` 静态方法。

```php
namespace App\Controller;

use App\Model\User;
use App\Http\Resources\UserResource;

class UserController
{
    public function index()
    {
        $users = User::all();
        
        return UserResource::collection($users);
    }
}
```
