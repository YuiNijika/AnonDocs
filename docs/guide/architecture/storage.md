# 文件存储 (Storage)

Anon Framework Next 提供了统一的文件存储抽象，默认支持 `local` 本地驱动。

本地文件默认存储在项目的 `run/storage` 目录下。

## 基础用法

通过 `Anon\Core\Facade\Storage` 门面进行文件操作：

```php
use Anon\Core\Facade\Storage;

// 写入文件 (自动创建所需目录)
Storage::put('avatars/1.jpg', $content);

// 读取文件内容
$content = Storage::get('avatars/1.jpg');

// 判断文件是否存在
if (Storage::exists('avatars/1.jpg')) {
    // ...
}

// 删除文件
Storage::delete('avatars/1.jpg');

// 获取文件的公网访问 URL
$url = Storage::url('avatars/1.jpg');
```
