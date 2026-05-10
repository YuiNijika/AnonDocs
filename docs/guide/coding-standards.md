# 开发规范

Anon Framework Next 采用现代 PHP 8.4+ 的严格类型标准，遵循 [PSR-12](https://www.php-fig.org/psr/psr-12/) 编码规范。统一的代码风格、命名规范和最佳实践，可以极大提高框架代码的质量和长期可维护性。

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

- **类库文件**：使用 `PascalCase`（大驼峰）。文件名必须与类名完全一致。例如：`Request.php`、`AuthManager.php`。
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

class RedisManager implements CacheContract 
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

## 3. 类型声明规范 (PHP 8+)

Anon Framework Next 强依赖 PHP 8 的类型系统，**必须**为所有可能的地方添加类型声明。

### 属性类型声明
```php
class User 
{
    protected int $id;
    protected string $name;
    protected ?array $metadata = null; // 允许为 null 的类型
}
```

### 方法参数与返回值类型声明
- 必须明确声明参数类型和返回值类型。
- 如果方法不返回任何内容，必须声明为 `void`。
- 善用 Union Types (联合类型) `int|string` 和 Mixed Types `mixed`。

```php
public function findUser(int|string $identifier): ?User 
{
    // ...
}

public function handle(Request $request): void 
{
    // ...
}
```

---

## 4. 注释规范

代码注释是开发者交流的桥梁。我们推倡“**代码即文档**”，通过清晰的命名和类型提示减少无意义的废话注释。

### DocBlock (文档块注释)

类、属性和方法在以下情况**必须**编写 DocBlock：
1. 方法包含复杂的业务逻辑或边界情况。
2. 参数使用了 `mixed` 或 `array`，需要解释数组结构。
3. 方法会抛出特定的 `Exception`。

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

### 行内注释

- **位置**：注释放在代码上方，与代码保持相同缩进。
- **格式**：使用 `//` 开头，后跟**一个空格**再写文字。
- **内容**：使用直观、简洁的中文。**解释为什么（Why）这么做，而不是在做什么（What）。**
- **避免废话**：不要写显而易见的注释。

#### ❌ 错误示例 (废话注释)
```php
// 检查用户名是否为空
if ($username === null) {
    // 抛出异常
    throw new Exception('用户名不能为空');
}
```

#### ✅ 正确示例 (解释为什么)
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

1. **避免魔术数字 (Magic Numbers)**：代码中不应出现无意义的数字，应提取为常量。
2. **尽早 Return (Early Return)**：减少 `if-else` 的嵌套层级，如果条件不满足，尽早抛出异常或返回。
   
   ```php
   // ❌ Bad
   public function process($user) {
       if ($user !== null) {
           if ($user->isActive()) {
               // 执行核心逻辑
           }
       }
   }
   
   // ✅ Good
   public function process($user) {
       if ($user === null || !$user->isActive()) {
           return;
       }
       // 执行核心逻辑
   }
   ```
3. **避免全局状态**：不要直接使用 `$_GET`, `$_POST`, `$_SERVER`，请使用 `$request->input()` 或 `Env::get()`。
4. **单次职责原则 (SRP)**：一个方法最好不要超过 50 行，如果过长，请将其拆分为多个受保护的 `protected` 辅助方法。
