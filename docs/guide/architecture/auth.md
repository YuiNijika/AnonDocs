# 身份认证 (Auth)

Anon Framework Next 提供了基于 JWT (JSON Web Token) 的无状态身份认证模块，非常适合 API 开发。

## 生成 Token

你可以通过 `Anon\Core\Facade\Auth` 门面为用户生成 Token：

```php
use Anon\Core\Facade\Auth;

// 传入用户数组或对象，默认有效期 7200 秒
$token = Auth::login(['id' => 1, 'name' => 'admin']);
```

## 验证与获取用户信息

客户端需要在 HTTP 请求头中携带 Token：
`Authorization: Bearer <your_token>`

服务端获取并验证：

```php
use Anon\Core\Facade\Auth;

// 检查当前请求是否已认证
if (Auth::check()) {
    // 返回解析后的 JWT payload 数组
    $user = Auth::user(); 
}
```

## 高级用法：多端 Token 隔离

默认的 `Auth` 门面依赖于 `.env` 中的 `JWT_SECRET`，并且将 Payload 封装得很简洁。如果你的系统比较复杂，比如既有普通用户（User）登录，又有后台管理员（Admin）登录，或者第三方 API 客户端授权，你希望他们的 Token 是完全隔离、互不通用的，你可以直接使用底层的 `JWTUtil` 工具类，并传入独立的密钥。

### 1. 配置独立密钥
在 `.env` 中定义多个 Secret：
```env
JWT_SECRET=default_secret_key
JWT_ADMIN_SECRET=admin_super_secret_key
JWT_API_SECRET=api_third_party_secret_key
```

### 2. 签发专属 Token
```php
use Anon\Core\Auth\JWTUtil;
use Anon\Core\Facade\Env;

// 给 API 客户端生成一个有效期 1 年的专属 Token
$payload = [
    'sub'  => 'client_id_1001',
    'role' => 'api_client',
    'iat'  => time(),
    'exp'  => time() + 31536000 
];

$apiSecret = Env::get('JWT_API_SECRET');
$apiToken = JWTUtil::encode($payload, $apiSecret);
```

### 3. 验证专属 Token
你可以编写一个专门的 API 授权中间件来解析它。由于签名时使用的是专属密钥，拿普通用户的 Token 尝试访问此接口时，底层 `hash_hmac` 会直接拒绝并抛出异常，从而实现了极度安全的权限隔离。

```php
use Anon\Core\Auth\JWTUtil;
use Anon\Core\Facade\Env;
use Anon\Core\Exception\HttpException;
use Anon\Core\Http\Request;

class ApiAuthMiddleware
{
    public function handle(Request $request, \Closure $next)
    {
        $token = $request->bearerToken();
        $apiSecret = Env::get('JWT_API_SECRET');

        try {
            // 必须使用专用密钥才能解码成功
            $payload = JWTUtil::decode($token, $apiSecret);
            
            // 可以将解析后的身份信息存入 request 供下游控制器使用
            $request->apiClient = $payload;
            
        } catch (\Exception $e) {
            throw new HttpException(401, 'Invalid API Token');
        }

        return $next($request);
    }
}
```