# 表单验证请求 (Form Request)

当你的控制器中充斥着复杂的验证逻辑时，代码会变得难以维护。Anon Framework Next 提供了 `FormRequest` 类，允许你将验证规则和授权逻辑完全从控制器中剥离出来。

---

## 创建 FormRequest 类

你可以继承 `Anon\Core\Http\FormRequest` 来创建一个独立的请求类。

```php
namespace Anon\Http\Requests;

use Anon\Core\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * 判断用户是否有权限发起请求
     */
    public function authorize(): bool
    {
        // 这里可以判断当前登录用户的权限
        return true;
    }

    /**
     * 定义验证规则
     */
    public function rules(): array
    {
        return [
            'username' => 'required|min:4|max:20',
            'email'    => 'required|email',
            'password' => 'required|min:6'
        ];
    }

    /**
     * 自定义验证错误提示 (可选)
     */
    public function messages(): array
    {
        return [
            'username.required' => '用户名不能为空',
            'email.email'       => '请输入有效的邮箱地址'
        ];
    }
}
```

---

## 在控制器中使用

创建好请求类后，只需在控制器的方法参数中类型提示该请求类即可。

框架的 **依赖注入容器** 和 **路由系统** 会在执行控制器方法前，自动实例化 `StoreUserRequest`，并执行其中的权限验证 (`authorize`) 和数据验证 (`rules`)。

- 如果 `authorize` 返回 `false`，将抛出 `403 Forbidden`。
- 如果数据验证失败，将抛出 `422 Unprocessable Entity`。

```php
namespace Anon\Controller;

use Anon\Http\Requests\StoreUserRequest;
use Anon\Core\Http\Response;

class UserController
{
    // 在进入 store 方法前，验证就已经自动完成了！
    public function store(StoreUserRequest $request): Response
    {
        // 直接读取已经过 FormRequest 校验的入参
        $data = $request->input();

        // ... 执行入库逻辑
        
        return Response::success($data, 'Created', 201);
    }
}
```

这种模式让你的控制器代码保持简洁。

---

## 和 OpenAPI 联动

如果控制器方法参数里直接注入了 `FormRequest`，并且当前路由没有手写 `schema()` 或 `requestBody`，OpenAPI 生成器会尝试从 `rules()` 自动推导请求结构。

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
use Anon\Controller\UserController;
use Anon\Core\Facade\Route;

Route::post('/users', [UserController::class, 'store'])
    ->summary('创建用户')
    ->successResponse([
        'id' => 'integer|required',
        'username' => 'string|required',
        'email' => 'string|required',
    ], 'Created', 201);
```

```php
namespace Anon\Controller;

use Anon\Core\Http\Response;
use Anon\Http\Requests\StoreUserRequest;

class UserController
{
    public function store(StoreUserRequest $request): Response
    {
        return Response::success($request->input(), 'Created', 201);
    }
}
```

执行 `php anon openapi:generate` 时：

- `POST`、`PUT`、`PATCH` 这类接口会优先推导为 `requestBody`
- `GET`、`DELETE`、`HEAD` 这类接口会优先推导为 query 参数

当前自动推导会识别一批常见规则：

- `required`
- `email`
- `integer` / `numeric` / `boolean`
- `array` / `object`
- `min` / `max`
- `in`

如果你需要更复杂的结构，例如嵌套对象、精确响应、多个 content-type，仍然推荐手动补 `schema()` 或 `openapi()`，显式声明优先级更高。
