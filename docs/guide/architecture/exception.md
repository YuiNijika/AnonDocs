# 异常体系 (Exception)

框架异常集中在 `Anon\Core\Exception` 命名空间。**类名不再重复 `Exception` 后缀**——目录本身已表达语义。

---

## 命名约定

| 类 | 用途 |
| --- | --- |
| `Base` | 框架异常基类，可统一 `catch (Base $e)` |
| `Http` | HTTP 业务异常（状态码 / `error_code` / 附加 data） |
| `Container` | 容器解析失败、循环依赖 |
| `Routing` | 路由注册、缓存、动作解析 |
| `Database` | PDO / Mongo 连接与查询 |
| `Cache` | 缓存驱动与 Redis 连接 |
| `Queue` | 队列载荷与任务解码 |
| `Validation` | 验证器内部错误（未知规则等） |
| `Auth` | JWT 解析 / 签名 / 过期 / 吊销 |
| `HttpClient` | 出站 HTTP 客户端 |
| `Storage` | 磁盘驱动与上传文件移动 |
| `Widget` | 小部件注册与渲染 |
| `WebSocket` | WebSocket 绑定失败等运行时错误 |
| `Deprecated` | 已废弃且不兼容的 API/配置（HTTP 410，`METHOD_DEPRECATED`） |
| `Handler` | 全局异常渲染（不是可抛异常） |

```php
use Anon\Core\Exception\Http;
use Anon\Core\Exception\Auth;
use Anon\Core\Exception\Database;

// 与领域模块同名时，用别名避免冲突
use Anon\Core\Exception\Cache as CacheError;
use Anon\Core\Exception\Queue as QueueError;
```

---

## HTTP 异常（API 响应）

`Http` 会被 `Handler` 识别并按状态码渲染统一 envelope：

```php
use Anon\Core\Exception\Http;

throw new Http(404, 'User not found.', [], null, 'USER_NOT_FOUND');

// 工厂方法
throw Http::unauthorized();
throw Http::forbidden('No access');
throw Http::validation(['email' => ['The email field is required.']]);
throw Http::tooManyRequests();
```

失败响应形状：

```json
{
  "success": false,
  "code": 422,
  "message": "Validation failed.",
  "error_code": "VALIDATION_FAILED",
  "errors": { "email": ["The email field is required."] }
}
```

---

## 废弃 API（不向后兼容）

不安全能力直接移除行为，而不是静默兼容：

1. **IDE**：方法加 `@deprecated` PHPDoc，补全时可见删除线提示  
2. **运行时**：抛出 `Anon\Core\Exception\Deprecated`  
   - HTTP：`code=410`，`error_code=METHOD_DEPRECATED`  
   - 消息示例：`Method Foo::bar() is deprecated and no longer supported.`

```php
use Anon\Core\Exception\Deprecated;

// 方法废弃
throw Deprecated::method(__METHOD__, 'NewApi::safe()');

// 配置废弃
throw Deprecated::config('queue.allowed_job_classes=true|\'*\'', 'Use an explicit class list.');
```

当前示例：`Queue::allowUnsafeJobUnserialize()`、配置 `queue.allowed_job_classes = true|'*'`。

---

## 领域异常 vs HTTP 异常

- **领域异常**（`Auth` / `Database` / `Queue` …）表示基础设施或内部错误，默认由 `Handler` 记日志并以 **500** 响应（生产环境隐藏细节）。
- **`Http`** 表示**有意返回给客户端**的业务状态（4xx/业务 5xx）。

业务层推荐：

```php
try {
    $payload = JWTUtil::decode($token);
} catch (Auth $e) {
    throw Http::unauthorized($e->getMessage());
}
```

---

## 全局处理

`Anon\Core\Exception\Handler`：

1. 触发 `exception_render` Hook（可返回自定义 `Response`）
2. 记录 `status >= 500` 到 `exception` 日志通道
3. 输出 JSON envelope 后安全结束请求（不依赖裸 `exit` 污染 CLI）

---

## 抛出规范（coding-standards）

- 消息使用**英文**，与框架其余错误文案一致
- 业务可读中文通过 `Http` 的 `message` 或前端 i18n 处理
- 不要 `throw new \Exception(...)`；优先领域类或 `Http`