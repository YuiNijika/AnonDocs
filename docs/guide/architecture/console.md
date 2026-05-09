# 命令行控制台 (Console)

Anon Framework Next 提供了一个独立的命令行工具 `anon`，它类似于 Laravel 的 Artisan 或 ThinkPHP 的 Console，旨在帮助你快速执行后台任务、启动服务或生成代码文件。

---

## 启动控制台

在项目骨架的根目录中，存在一个名为 `anon` 的可执行文件。你可以通过 PHP 直接运行它：

```bash
php anon
```

如果不带任何参数，它会列出当前应用支持的所有命令及帮助信息：

```bash
$ php anon
Anon Framework Next CLI (v1.0.0)

Available commands:
  dev                  Start the built-in PHP development server
  make:controller      Create a new controller class
  make:model           Create a new model class
  make:middleware      Create a new middleware class
```

---

## 内置命令

### dev
启动 PHP 内置的高性能开发服务器，它会自动将文档根目录指向 `run/`，便于你进行本地 API 开发和调试。

```bash
php anon dev
```
默认监听 `127.0.0.1:8000`。你可以通过选项覆盖：
```bash
php anon dev --host=0.0.0.0 --port=8080
```

### 生成器命令
框架提供了一系列 `make:*` 命令来快速生成基础代码文件：

```bash
# 生成控制器 (保存在 app/controller 目录下)
php anon make:controller UserController

# 生成模型 (保存在 app/model 目录下)
php anon make:model User

# 生成中间件 (保存在 app/middleware 目录下)
php anon make:middleware AuthMiddleware
```

---

## 编写自定义命令

随着业务发展，你可能需要编写自己的命令（如定时任务、数据迁移等）。

1. 继承基础的 `Anon\Core\Console\Command` 类。
2. 设置 `$name` 和 `$description` 属性。
3. 实现 `execute(array $args): int` 方法。

```php
<?php

namespace Anon\Command;

use Anon\Core\Console\Command;

class HelloCommand extends Command
{
    protected string $name = 'hello';
    protected string $description = 'Say hello to the framework';

    public function execute(array $args): int
    {
        // $this->info() 会输出带绿色的提示文字
        $this->info("Hello, Anon Framework Next!");
        
        // 也可以使用 $this->getOption() 获取命令行参数
        $name = $this->getOption($args, 'name', 'Guest');
        echo "Nice to meet you, {$name}\n";

        return 0; // 返回 0 代表执行成功
    }
}
```

随后，你需要将该命令注册到 `Console\Application` 中即可生效（未来我们可能会支持自动扫描加载）。