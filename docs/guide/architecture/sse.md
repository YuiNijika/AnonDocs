# Server-Sent Events (SSE)

Anon 内置 `Response::sse()` 与 `Anon\Core\Http\Sse` 工具类，用于在 **普通 HTTP 请求** 上推送单向事件流（`text/event-stream`）。

典型场景：AI token 流、进度推送、日志 tail。

---

## 快速开始

```php
use Anon\Core\Http\Response;
use Anon\Core\Http\Sse;
use Anon\Core\Facade\Route;

Route::get('/events', function () {
    return Response::sse(function (): void {
        // 首包 + 填充，尽快完成 TTFB（反代 / CDN 场景）
        Sse::kickoff();

        for ($i = 1; $i <= 5; $i++) {
            if (!Sse::connected()) {
                break; // 客户端已断开
            }
            Sse::event(['n' => $i], event: 'tick', id: (string) $i);
            sleep(1);
        }

        Sse::done(); // data: [DONE]
    });
});
```

浏览器：

```js
const es = new EventSource('/events');
es.addEventListener('tick', (e) => console.log(JSON.parse(e.data)));
es.onmessage = (e) => console.log(e.data);
```

---

## API

### `Response::sse(callable $callback, int $status = 200, array $headers = [])`

- 自动合并 `Sse::headers()`（`Content-Type: text/event-stream`、`X-Accel-Buffering: no` 等）
- 在 headers 发出后执行 `$callback`
- 底层与 `Response::stream()` 相同；SSE 请优先用 `sse()`

### `Response::stream(callable $callback, ...)`

原始流式输出。自行设置响应头时使用。

### `Sse` 工具方法

| 方法 | 作用 |
|------|------|
| `Sse::headers()` | 推荐响应头数组 |
| `Sse::prepare()` | 关闭 PHP 输出压缩/缓冲 |
| `Sse::connected()` | 客户端是否仍在线 |
| `Sse::kickoff($padding = 2048)` | prepare + 注释首包 |
| `Sse::comment($text)` | SSE 注释行（客户端忽略） |
| `Sse::event($data, $event?, $id?, $retryMs?)` | 标准事件 |
| `Sse::data($data)` | 仅 `data:` 字段 |
| `Sse::done()` | `data: [DONE]` |
| `Sse::ping()` | 心跳注释 |
| `Sse::flush($raw)` | 原样写出任意字节（上游 SSE 透传） |
| `Sse::whileConnected($tick, $idlePingSeconds = 0)` | 在线循环；`$tick` 返回 `false` 结束 |
| `Sse::passthrough($streamer, $kickoff = true)` | 上游透传封装（onChunk / onIdle） |

`$data` 为数组/对象时自动 `json_encode`（`JSON_UNESCAPED_UNICODE`）。

---

## 循环推送

```php
return Response::sse(function (): void {
    Sse::kickoff();
    $i = 0;
    Sse::whileConnected(function () use (&$i) {
        $i++;
        Sse::data(['i' => $i, 't' => time()]);
        sleep(1);
        return $i < 60; // false 结束
    }, idlePingSeconds: 15);
});
```

---

## 上游 SSE 透传

代理 OpenAI 兼容流时，不要二次解析，直接透传：

```php
return Response::sse(function () use ($upstream): void {
    Sse::passthrough($upstream); // 内部 kickoff + flush + 空闲 ping
});
```

等价于：

```php
Sse::kickoff();
$upstream(
    onChunk: static fn (string $chunk) => Sse::flush($chunk),
    onIdle: static fn () => Sse::ping(),
);
```

---

## 部署注意

1. **Nginx**：location 内建议 `proxy_buffering off;`；框架已带 `X-Accel-Buffering: no`
2. **Cloudflare**：约 100s 无首包会 524；用 `kickoff()` 尽快出字节，空闲时 `ping()`
3. **PHP-FPM**：避免对 SSE 路由开 gzip；`set_time_limit(0)` 视业务需要
4. 长推送循环务必检查 `Sse::connected()`，避免客户端断开后继续算
5. SSE **单向**；需要双向通信请用 [WebSocket](./websocket)

---

## 与 WebSocket 的选择

| | SSE | WebSocket |
|--|-----|-----------|
| 方向 | 服务端 → 客户端 | 双向 |
| 协议 | 普通 HTTP | 独立 `ws` 进程 |
| 防火墙 | 友好（走 80/443） | 需额外端口/反代 |
| 复杂度 | 低 | 中 |

只推流用 SSE；聊天室、协同编辑用 WebSocket。