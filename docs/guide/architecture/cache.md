# 缓存系统 (Cache)

Anon Framework Next 提供了统一的缓存系统接口，目前支持 `File` 和 `Redis` 两种驱动。缓存系统通过统一的 `Contract` 进行规范，保证了不同驱动之间的高度兼容性。

## 配置

缓存驱动可以在 `.env` 文件中进行配置：

```env
# 默认缓存驱动: file 或 redis
CACHE_DRIVER=file

# Redis 缓存配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=anon:cache:
```

## 基础使用

框架提供了 `Anon\Core\Facade\Cache` 门面供全局静态调用。

### 写入缓存

```php
use Anon\Core\Facade\Cache;

// 写入缓存，第三个参数为过期时间（秒），不传或传 null 代表永不过期
Cache::set('user_1', ['name' => 'Anon'], 3600);
```

### 读取缓存

```php
// 读取缓存，如果不存在则返回 null
$user = Cache::get('user_1');

// 读取缓存，并指定默认值
$user = Cache::get('user_1', ['name' => 'Default']);
```

### 判断缓存是否存在

```php
if (Cache::has('user_1')) {
    // 缓存存在
}
```

### 删除与清空缓存

```php
// 删除指定键名的缓存
Cache::delete('user_1');

// 清空当前驱动的所有缓存数据（慎用）
Cache::clear();
```

## 切换驱动

如果你同时配置了多种驱动，可以在运行时临时切换：

```php
// 显式使用 redis 驱动
Cache::store('redis')->set('key', 'value');

// 显式使用 file 驱动
Cache::store('file')->get('key');
```
