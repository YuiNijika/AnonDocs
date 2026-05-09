# 异步任务队列 (Queue)

在构建 API 时，部分操作（如发送注册邮件、生成报表、调用慢速第三方接口）会显著拖慢响应时间。Anon Framework Next 提供了基于 Redis 的轻量级异步任务队列，让你能够将耗时任务放入后台处理。

---

## 配置文件与依赖

队列功能依赖于 `Redis`。请确保已在 `.env` 中正确配置了 Redis 的连接信息：

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
QUEUE_PREFIX=anon:queue:
```

---

## 创建任务 (Job)

你可以使用 CLI 工具快速生成一个任务类：

```bash
php anon make:job SendWelcomeEmail
```

这会在 `app/jobs/SendWelcomeEmail.php` 下生成文件。

### 编写任务逻辑

任务类必须实现 `Anon\Core\Queue\Job` 接口。你可以将需要的数据通过构造函数传入，并在 `handle` 方法中编写实际执行的耗时逻辑。

```php
namespace App\Jobs;

use Anon\Core\Queue\Job;
use Anon\Core\Facade\Log;

class SendWelcomeEmail implements Job
{
    protected array $user;

    public function __construct(array $user)
    {
        $this->user = $user;
    }

    public function handle(): void
    {
        // 模拟耗时的发邮件操作
        sleep(2);
        
        Log::info("Welcome email sent to: " . $this->user['email']);
    }
}
```

---

## 推送任务到队列

在你的控制器或业务逻辑中，通过 `Queue` 门面将任务对象推送至后台。

```php
namespace App\Controller;

use Anon\Core\Http\Response;
use Anon\Core\Facade\Queue;
use App\Jobs\SendWelcomeEmail;

class AuthController
{
    public function register(): Response
    {
        // ... 注册逻辑，将用户存入数据库
        $user = ['email' => 'newuser@example.com'];

        // 将发邮件任务推送到默认队列
        Queue::push(new SendWelcomeEmail($user));

        return Response::json(['msg' => 'Registration successful!']);
    }
}
```

此时请求会立即返回，而任务已经序列化并持久化在 Redis 队列中。

---

## 运行队列处理器 (Worker)

为了让推送到队列的任务得以执行，你需要启动队列处理器守护进程：

```bash
php anon queue:work
```

你也可以指定要监听的队列名称：

```bash
php anon queue:work --queue=emails
```

> **注意：** 在生产环境中，建议使用 `Supervisor` 或 `Systemd` 来管理 `queue:work` 进程，确保它在意外退出时能自动重启。
