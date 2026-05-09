# 开发规范

统一的代码风格、命名规范和最佳实践，确保代码质量和可维护性。

---

## 代码风格

### 基本格式

- **缩进**：使用 4 个空格，不使用 Tab
- **换行**：Unix 风格 LF，不使用 Windows 风格 CRLF
- **编码**：UTF-8 without BOM
- **行尾空格**：删除所有行尾空格
---

## 命名规范

### 类名

- 使用 `PascalCase`，大驼峰

### 方法名

- 使用 `camelCase`，小驼峰
- 示例：`getUserInfo()`、`addRoute()`、`requireAuth()`

```php
public function getUserInfo($uid)
{
    // ...
}

public function addRoute(string $path, callable $handler)
{
    // ...
}
```

### 常量名

- 使用 `UPPER_SNAKE_CASE`，全大写下划线
- 示例：`ANON_ALLOWED_ACCESS`、`ANON_DB_HOST`、`RouterMeta`

```php
define('ANON_ALLOWED_ACCESS', true);
define('ANON_DB_HOST', 'localhost');
```

### 变量名

- 使用 `camelCase`，小驼峰
- 示例：`$userInfo`、`$requestPath`、`$userId`

```php
$userInfo = \Anon\Modules\Http\RequestHelper::requireAuth();
$requestPath = self::getRequestPath();
$userId = (int)$_SESSION['user_id'];
```

### 文件名

- **路由文件**：使用 `PascalCase`，如 `Login.php`、`User/Info.php`
- **配置文件**：使用 `camelCase`，如 `useApp.php`、`useRouter.php`
- **类文件**：与类名保持一致

---

## 注释规范

### 注释风格

- **注释风格**：使用直观、简洁的中文注释
- **避免括号**：注释中不要使用括号进行解释
- **位置**：注释放在代码上方，与代码对齐
- **必要性**：只写必要注释，显而易见的代码不要注释
- **一致性**：同一文件同一风格，避免中英混用
- **DocBlock**：类、接口、属性和方法必须使用 PHPDoc 标准注释

### 正确示例

```php
// 防止XSS清理用户名并限制长度最大255字符
if ($username !== null) {
    $username = mb_substr(trim($username), 0, 255, 'UTF-8');
}

// 获取用户ID从会话或Cookie
$userId = RequestHelper::getUserId();

// 验证IP地址格式，无效IP设为默认值
$ip = RequestHelper::getClientIp() ?? '0.0.0.0';
if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    $ip = '0.0.0.0';
}
```

### 错误示例

```php
// ❌ 错误：清理用户名，防止XSS，限制长度，最大255字符
// ❌ 错误：获取用户ID，从会话或Cookie
// ❌ 错误：验证IP地址格式，无效IP设为默认值
```

### 复杂逻辑注释示例

```php
// 使用无后缀URL返回附件，避免浏览器按静态资源规则直接404
$url = '/anon/static/upload/' . $fileType . '/' . $baseName;

// 命中处理后的缓存文件直接返回，避免重复压缩
if (file_exists($targetPath) && filemtime($targetPath) >= filemtime($originalPath)) {
    return $targetPath;
}
```

### 方法注释

```php
/**
 * 获取用户信息
 * @param int $uid 用户ID
 * @return array 用户信息
 */
public function getUserInfo($uid)
{
    // ...
}
```

---