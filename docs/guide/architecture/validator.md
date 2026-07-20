# 数据验证器 (Validator)

通过 `Anon\Core\Facade\Validator` 或 `FormRequest` 验证输入。默认错误文案为**英文**，可用 `messages` 覆盖。

---

## 基础使用

```php
use Anon\Core\Facade\Validator;
use Anon\Core\Http\Request;
use Anon\Core\Http\Response;

Route::post('/register', function (Request $request) {
    $validator = Validator::make($request->all(), [
        'username' => 'required|max:20|alpha_num',
        'email'    => 'required|email',
        'password' => 'required|min:8|confirmed',
        'age'      => 'nullable|integer|min:18',
        'website'  => 'nullable|url',
    ], [
        // 可选：覆盖默认英文文案
        'username.required' => '必须填写用户名',
        'password.confirmed' => '两次密码不一致',
    ]);

    if ($validator->fails()) {
        return Response::error(
            $validator->firstError(),
            422,
            $validator->errors(),
            'VALIDATION_FAILED'
        );
    }

    return Response::success($request->only(['username', 'email']));
});
```

`FormRequest` 失败时会直接抛出 `Http::validation(...)`（422）。

---

## 规则一览

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| `required` | 非 null / 非空串 / 非空数组 | `required` |
| `nullable` | 空值时跳过后续规则 | `nullable\|email` |
| `email` | 合法邮箱 | `email` |
| `max:n` | 数字上限 / 字符串长度 / 数组元素数 | `max:255` |
| `min:n` | 同上下限 | `min:6` |
| `numeric` | 数字或数字字符串 | `numeric` |
| `integer` | 整数 | `integer` |
| `boolean` | true/false/0/1/`'true'` 等 | `boolean` |
| `array` | 数组 | `array` |
| `date` | 可被 `DateTimeImmutable` 解析 | `date` |
| `in:a,b` | 白名单 | `in:admin,user` |
| `confirmed` | 与 `{field}_confirmation` 一致 | `confirmed` |
| `same:field` | 与另一字段相同 | `same:password` |
| `different:field` | 与另一字段不同 | `different:old_password` |
| `regex:pattern` | 正则；模式内允许冒号 | `regex:^[a-z]+:[0-9]+$` |
| `alpha` | 仅字母（Unicode） | `alpha` |
| `alpha_num` | 字母与数字 | `alpha_num` |
| `url` | URL | `url` |
| `ip` | IP | `ip` |
| `json` | JSON 字符串 | `json` |

点号路径字段：`address.city`。

未知规则会抛出 `Anon\Core\Exception\Validation`。

---

## 默认英文消息示例

```text
The email field is required.
The email field must be a valid email address.
The password field confirmation does not match.
```

业务侧始终可通过第三个参数或 `FormRequest::messages()` 本地化。

---

## 错误读取

```php
$errors = $validator->errors();   // field => string[]
$first  = $validator->firstError(); // string|null
```