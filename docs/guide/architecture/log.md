# 日志系统 (Log)

Anon Framework Next 提供了非常轻量的基于文件系统的日志组件，能够按天切割日志文件，并将不同类型的业务日志进行隔离。

默认情况下，所有的日志文件都会被写入到 `runtime/log` 目录下。

## 基础使用

你可以通过 `Anon\Core\Facade\Log` 门面记录不同级别的日志。该方法接受字符串或者数组作为日志载荷，如果是数组则会自动将其转换为 JSON 格式存储。

```php
use Anon\Core\Facade\Log;

// 记录普通信息
Log::info('This is an info message.');

// 记录错误
Log::error(['error_code' => 500, 'message' => 'Something went wrong']);

// 记录调试信息
Log::debug('Debugging connection...');

// 记录警告
Log::warning('Disk space is running low.');
```

## 自定义日志通道 (分类)

日志系统的每个方法都接收一个可选的第二个参数 `$type`，它表示日志的分类通道（默认是 `'app'`）。
当传入分类时，日志将会被写入到对应名称的独立文件中，例如 `access.log` 或 `sql.log`。

```php
// 该条日志将被写入 runtime/log/YYYY-MM-DD/access.log
Log::info('User login successful', 'access');

// 该条日志将被写入 runtime/log/YYYY-MM-DD/sql.log
Log::debug('SELECT * FROM users', 'sql');
```

## 异常接管

框架底层实现了全局的异常处理器 `Anon\Core\Exception\Handler`。当发生 HTTP 500 及以上级别的致命错误或未捕获异常时，系统会自动拦截并使用 `Log::error(..., 'exception')` 将堆栈信息记录到 `exception.log` 中。
