# 数据库与查询构建器

Anon Framework Next 内置了基于 PDO 的轻量级数据库查询构建器和 ActiveRecord 风格的 ORM，支持 `MySQL`, `PostgreSQL`, `SQLite`, `SQLServer`, `Oracle` 等多种数据库。它提供了流畅的链式调用，使得编写 SQL 语句变得简单安全。

## 配置

在项目的根目录下的 `.env` 文件中配置数据库连接信息：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=anon_test
DB_USER=root
DB_PASSWORD=root
DB_CHARSET=utf8mb4
```

## 数据库事务

查询构建器提供了开箱即用的事务支持，确保多步数据库操作的原子性：

```php
try {
    DB::beginTransaction();

    DB::table('users')->where('id', 1)->update(['balance' => 100]);
    DB::table('orders')->insert(['user_id' => 1, 'amount' => 50]);

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

你可以通过 `Anon\Core\Facade\DB` 这个门面类直接进行数据库操作。

### 执行原生 SQL

```php
use Anon\Core\Facade\DB;

// 执行查询并获取结果集
$users = DB::select('SELECT * FROM users WHERE status = ?', [1]);

// 执行写入/更新/删除等操作，返回受影响的行数
$affected = DB::statement('UPDATE users SET status = ? WHERE id = ?', [0, 1]);
```

### 查询构建器 (Query Builder)

我们推荐使用查询构建器进行数据操作，它更加安全和直观。

#### 查询数据

```php
// 获取所有数据
$users = DB::table('users')->get();

// 指定查询字段
$users = DB::table('users')->select(['id', 'name', 'email'])->get();

// 获取单条数据
$user = DB::table('users')->where('id', 1)->first();

// 获取数据总数
$count = DB::table('users')->where('status', 1)->count();

// 判断记录是否存在
$exists = DB::table('users')->where('email', 'admin@example.com')->exists();
```

#### 条件查询

```php
// AND 条件
DB::table('users')->where('status', 1)->where('role_id', 2)->get();

// OR 条件
DB::table('users')->where('status', 1)->orWhere('role_id', 2)->get();

// IN 查询
DB::table('users')->whereIn('id', [1, 2, 3])->get();

// NULL 查询
DB::table('users')->whereNotNull('email')->get();
```

#### 排序与分页

```php
$users = DB::table('users')
    ->orderBy('created_at', 'DESC')
    ->limit(10)
    ->offset(20)
    ->get();

// 自动获取 $_GET['page'] 并分页，每页 15 条
$result = DB::table('users')->paginate(15);

// 分页返回结构包含: total, per_page, current_page, last_page, data
```

#### 连表查询 (Join)

```php
$users = DB::table('users')
    ->select(['users.id', 'users.name', 'roles.role_name'])
    ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
    ->get();
```

#### 插入数据

```php
// 插入单条数据，返回插入的ID
$insertId = DB::table('users')->insert([
    'name' => 'Anon',
    'email' => 'anon@example.com'
]);
```

#### 更新与删除数据

```php
// 更新数据
DB::table('users')->where('id', 1)->update(['status' => 0]);

// 删除数据
DB::table('users')->where('status', 0)->delete();
```

### ORM 模型 (Model)

Anon Framework Next 提供了基于 ActiveRecord 模式的基础 ORM 模型。

定义模型类，继承 `Anon\Core\Database\Model`：

```php
namespace Anon\Model;

use Anon\Core\Database\Model;

class User extends Model
{
    protected string $table = 'users';
    protected string $primaryKey = 'id';
}
```

使用模型进行数据操作，查询结果将自动转换为 Model 实例数组：

```php
use Anon\Model\User;

// 查询所有记录
$users = User::all();

// 根据主键查询单条记录
$user = User::find(1);

// 结合查询构建器进行条件查询
$user = User::where('status', 1)->first();

// 创建新数据
$user = User::create(['name' => 'Anon', 'email' => 'anon@example.com']);

// 更新数据
$user = User::find(1);
if ($user) {
    $user->name = 'New Name';
    $user->save();
}

// 批量删除数据
User::destroy(1);
User::destroy([1, 2, 3]);
```
