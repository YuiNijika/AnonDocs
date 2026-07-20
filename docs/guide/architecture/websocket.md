# WebSocket

Anon 提供基于 RFC6455 的轻量 WebSocket 运行时：

- `Anon\Core\WebSocket\Server` — 事件循环 / 握手 / 路由 / 心跳
- `Connection` — 单连接收发、query、远程地址、分片重组
- `Frame` — 帧编解码
- `Handler` / `AbstractHandler` — 类式生命周期
- 控制台命令 `php anon ws`
- 异常 `Anon\Core\Exception\WebSocket`

> WebSocket **不走** `php -S` / PHP-FPM 的 HTTP 路由，需独立进程（`php anon ws`）。

---

## 启动

```bash
php anon ws
php anon ws --host=0.0.0.0 --port=8081
```

配置（`anon.config.php`）：

```php
return Config::define([
    'websocket' => [
        'host'              => '0.0.0.0',
        'port'              => 8081,
        'max_connections'   => 1024,
        'max_message_bytes' => 1048576,
        'heartbeat'         => 30,      // 秒，空闲 ping；0 关闭
        'idle_timeout'      => 90,      // 秒无活动断开；0 = 2*heartbeat
        // 'allowed_origins' => ['https://app.example.com'],
        // 'subprotocols'    => ['chat.v1'],
    ],
]);
```

命令行会读取上述项；也可在 `websocket.php` 里链式覆盖：

```php
$server->maxConnections(256)->heartbeat(20)->allowedOrigins(['https://a.com']);
```

---

## 路由文件 `websocket.php`

项目根目录放置 `websocket.php`：

**方式 A：闭包配置 Server**

```php
<?php

use Anon\Core\WebSocket\Connection;
use Anon\Core\WebSocket\Server;

return function (Server $server): void {
    $server->route('/echo', [
        'open' => function (Connection $c): void {
            $c->sendJson([
                'type'  => 'welcome',
                'id'    => $c->id(),
                'query' => $c->queryParams(), // ws://host/echo?token=xxx
            ]);
        },
        'message' => function (Connection $c, string $message, int $opcode): void {
            $c->send($message);
        },
        'close' => function (Connection $c): void {
            // ...
        },
    ]);

    $server->route('/chat', function (Connection $c, string $message) use ($server): void {
        $server->broadcast($message, path: '/chat');
    });
};
```

**方式 B：直接返回 Server 实例**

```php
<?php

use Anon\Core\WebSocket\Server;

$server = new Server('0.0.0.0', 8081);
$server->route('/echo', /* ... */);

return $server;
```

若没有 `websocket.php`，命令会自动挂演示路由 **`/echo`**。

---

## Handler 类

```php
use Anon\Core\WebSocket\AbstractHandler;
use Anon\Core\WebSocket\Connection;

final class ChatHandler extends AbstractHandler
{
    public function onMessage(Connection $connection, string $message, int $opcode): void
    {
        $connection->sendJson(['echo' => $message]);
    }
}

// websocket.php
$server->route('/chat', new ChatHandler());
```

也可直接实现 `Handler` 接口（需写齐 `onOpen` / `onMessage` / `onClose`）。

---

## Connection API

| 方法 | 说明 |
|------|------|
| `id()` | 连接 ID |
| `path()` | 握手路径 |
| `query()` / `queryParams()` | URL 查询串 |
| `remoteAddress()` | 对端 `ip:port` |
| `headers()` / `header($name)` | 握手 HTTP 头（小写键） |
| `send($text, $opcode?)` | 发文本/二进制帧 |
| `sendJson($data)` | JSON 文本帧 |
| `sendBinary($bytes)` | 二进制帧 |
| `ping` / `pong` | 控制帧 |
| `close($code, $reason)` | 关闭 |
| `set` / `get` | 连接级属性袋 |
| `isOpen()` | 是否仍打开 |

`Server`：

| 方法 | 说明 |
|------|------|
| `route` / `paths` | 注册与列出路由 |
| `broadcast` / `broadcastJson` | 广播（可按 path） |
| `find($id)` | 按连接 ID 查找 |
| `connectionCount` / `connections` | 在线连接 |
| `maxConnections` / `maxMessageBytes` | 上限 |
| `heartbeat` / `idleTimeout` | 心跳与空闲断开 |
| `allowedOrigins` / `subprotocols` | 安全与子协议 |
| `stop` | 停止循环（SIGINT/SIGTERM 在支持 pcntl 时自动调用） |

---

## 内建能力

- **分片重组**：客户端 FIN=0 的 continuation 帧会自动拼成完整消息
- **消息/缓冲上限**：超限关闭码 `1009`
- **连接数上限**：超限握手 `503`
- **Origin 校验**：配置 `allowed_origins` 后校验浏览器 Origin
- **子协议协商**：`Sec-WebSocket-Protocol`
- **心跳**：空闲 `ping`；超时断开
- **优雅退出**：Linux 下 `SIGINT`/`SIGTERM` 触发 `stop()`

---

## 客户端示例

```js
const ws = new WebSocket('ws://127.0.0.1:8081/echo?token=demo');
ws.onopen = () => ws.send('hello');
ws.onmessage = (e) => console.log(e.data);
```

---

## Nginx 反代示例

```nginx
location /ws/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 3600s;
}
```

---

## 限制与定位

- 单进程 `stream_select` 模型，适合开发与中小并发
- 不内置集群 / Redis PubSub；多机需自建广播层
- 生产高并发可考虑 Swoole/RoadRunner 等，本实现保持零扩展依赖
- 单向推流优先用 [SSE](./sse)，与现有 HTTP 路由一体部署更简单