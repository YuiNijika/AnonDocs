# 开发规范

Anon Framework Next 采用 PHP 8.4+ 严格类型标准，遵循 [PSR-12](https://www.php-fig.org/psr/psr-12/) 编码规范。统一的代码风格、命名规范和最佳实践，可以提高框架代码的质量和可维护性。

---

## 1. 编码与风格

### 基本格式

- **PHP 版本**：强制使用 PHP 8.4+ 的语法特性（如 Union Types、Named Arguments、Match 表达式等）。
- **缩进**：强制使用 **4 个空格**，绝不使用 Tab。
- **换行**：强制使用 Unix 风格 LF（`\n`），绝不使用 Windows 风格 CRLF。
- **编码**：强制使用 UTF-8 无 BOM 格式。
- **闭合标签**：纯 PHP 文件**必须省略**结尾的 `?>` 标签。
- **严格类型**：所有新建的框架核心层文件，建议在第一行声明 `declare(strict_types=1);`。

---

## 2. 命名规范

### 目录与文件

- **类库文件**：使用 `PascalCase`（大驼峰）。文件名必须与类名完全一致。例如：`Request.php`、`Manager.php`。
- **目录语义优先**：如果父目录已经明确表达上下文，类名应尽量保持简洁。例如优先使用 `Auth/Manager.php`、`Queue/Manager.php`，而不是 `Auth/AuthManager.php`、`Queue/QueueManager.php`。
- **配置文件**：位于 `.env` 或小写文件。
- **视图/模板文件**：使用 `kebab-case`（短横线）。例如：`error-500.php`。

### 类、接口与 Trait

- 强制使用 `PascalCase`（大驼峰）。
- 接口名称可以以 `Interface` 或 `Contract` 结尾（如 `CacheContract`）。
- Trait 名称建议以 `Trait` 结尾。

```php
namespace Anon\Core\Cache;

interface CacheContract 
{
    // ...
}

class Manager implements CacheContract 
{
    // ...
}
```

### 方法与函数

- 强制使用 `camelCase`（小驼峰）。
- 方法名应使用动词或动宾短语。例如：`getUserInfo()`、`dispatch()`、`hasFile()`。

### 变量与属性

- 强制使用 `camelCase`（小驼峰）。
- 布尔类型的变量建议以 `is`、`has`、`should` 开头。例如：`$isValid`、`$hasFile`。

### 常量

- 强制使用 `UPPER_SNAKE_CASE`（全大写下划线）。
- 类常量和全局常量都适用。例如：`APP_VERSION`、`DEFAULT_TIMEOUT`。

---

## 3. 类型声明规范

PHP 8.4+ 提供了类型系统，我们必须充分利用。

- **属性、参数、返回值必须声明类型。**
- **联合类型**：使用 `|`，例如 `int|string`。
- **可空类型**：使用 `?`，例如 `?string` (等价于 `string|null`)。
- **混合类型**：在不确定的场景下使用 `mixed`。

```php
public function getUserName(int $userId): ?string
{
    // ...
}
```

---

## 4. 注释规范

代码注释是开发者交流的桥梁。我们提倡“代码即文档”，通过清晰的命名和类型提示减少无意义的注释。

### DocBlock (文档块注释)

类、属性和方法在以下情况编写 DocBlock：
- 方法包含复杂的业务逻辑或边界情况。
- 参数使用了 `mixed` 或 `array`，需要解释数组结构。
- 方法会抛出特定的 `Exception`。

```php
/**
 * 从队列中弹出并执行任务（阻塞模式）
 *
 * @param string|null $queue 队列名称
 * @param int $timeout 阻塞超时时间(秒)
 * @return Job|null 返回任务实例，超时返回 null
 * @throws Exception 当 Redis 扩展未加载时抛出
 */
public function pop(?string $queue = null, int $timeout = 3): ?Job
{
    // ...
}
```

### 行内注释：解释为什么 (Why)

行内注释用于解释“为什么这么做”，而不是“这段代码在做什么”。代码本身应该足够清晰以表达“在做什么”。

#### ❌ 错误示例
```php
// 如果状态是 1
if ($status === 1) {
    // 增加计数器
    $count++;
}
```

#### ✅ 正确示例
```php
// 针对 Redis 断开连接的情况，休眠 3 秒防止死循环耗尽 CPU
catch (\Throwable $e) {
    Log::error("Job failed: " . $e->getMessage());
    sleep(3);
}

// 洋葱模型异常穿透, 此处必须 throw $e 交给最外层 Handler 统一拦截
catch (\Throwable $e) {
    throw $e;
}
```

---

## 5. 最佳实践与避坑指南

### 尽早 Return (Early Return)

避免深层嵌套的 `if-else`。当条件不满足时，尽早抛出异常或返回，保持主逻辑在最外层。

#### ❌ 错误示例
```php
public function updateProfile(Request $request) 
{
    if ($request->has('user_id')) {
        $user = User::find($request->input('user_id'));
        if ($user) {
            if ($user->status === 1) {
                // 执行更新...
                return true;
            } else {
                throw new Exception('用户被禁用');
            }
        } else {
            throw new Exception('用户不存在');
        }
    }
}
```

#### ✅ 正确示例
```php
public function updateProfile(Request $request) 
{
    if (!$request->has('user_id')) {
        return false;
    }

    $user = User::find($request->input('user_id'));
    
    if (!$user) {
        throw new Exception('用户不存在');
    }
    
    if ($user->status !== 1) {
        throw new Exception('用户被禁用');
    }
    
    // 执行更新...
    return true;
}
```

### 避免直接操作超全局变量

永远不要在代码中直接读取 `$_GET`, `$_POST` 或 `$_FILES`。框架已经对输入进行了安全过滤和封装。

- ❌ `$_GET['id']`
- ✅ `$request->input('id')` 或 `$request->route('id')`

### 魔术数字 (Magic Numbers)

避免在代码中使用无意义的数字，应将其提取为有意义的常量或枚举。

#### ❌ 错误示例
```php
if ($user->status === 2) {
    // ...
}
```

#### ✅ 正确示例
```php
class User
{
    public const STATUS_BANNED = 2;
}

if ($user->status === User::STATUS_BANNED) {
    // ...
}
```

### 单次职责原则 (SRP)

一个方法应尽量保持简短。如果一个方法过长，应将其拆分为多个受保护的 `protected` 辅助方法。
