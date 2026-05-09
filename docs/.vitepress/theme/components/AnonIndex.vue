<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VPButton } from "vitepress/theme";

const isVisible = ref(false);
const activeTab = ref("路由与中间件");
const highlightedCode = ref("");

const switchTab = async (tabName: string) => {
  activeTab.value = tabName;
  const file = codeFiles.find((f) => f.name === tabName);
  if (!file) return;

  const { codeToHtml } = await import("shiki");

  highlightedCode.value = await codeToHtml(file.code.trim(), {
    lang: file.language,
    theme: "github-dark",
    defaultColor: false,
  });
};

onMounted(async () => {
  await switchTab("路由与中间件");
  setTimeout(() => isVisible.value = true, 100);
});

const features = [
  {
    icon: "⚡",
    title: "轻量与高性能",
    description: "剥离历史包袱，核心架构零冗余，专注于构建快速响应的 RESTful API 服务。",
  },
  {
    icon: "📦",
    title: "依赖注入容器",
    description: "内置容器支持自动依赖装配与循环检测，轻松实现单例绑定与业务解耦。",
  },
  {
    icon: "🛣️",
    title: "灵活的路由系统",
    description: "支持正则匹配与路由组嵌套，结合洋葱模型中间件栈，实现清晰的请求分发。",
  },
  {
    icon: "🛡️",
    title: "开箱即用的 ORM",
    description: "提供基础 QueryBuilder，支持多数据库环境 (MySQL/PgSQL/SQLite等) 及迁移功能。",
  },
  {
    icon: "🔐",
    title: "安全防护机制",
    description: "原生集成 JWT 多 Guard 认证、跨域资源共享 (CORS) 以及接口限流 (Rate Limiter)。",
  },
  {
    icon: "⚙️",
    title: "完善的组件生态",
    description: "内置轻量级异步任务队列、HTTP客户端、文件安全存储及表单请求验证器。",
  },
];

const techStack = [
  "PHP 8.1+",
  "RESTful API",
  "JWT Auth",
  "IoC Container",
  "Async Queue",
];

const badges = [
  { icon: "🚀", text: "Modern PHP API Framework" },
  { icon: "🛡️", text: "Secure & Lightweight" },
];

const hero = {
  title: {
    gradient: "Anon Framework ",
    plain: "Next",
  },
  description: `
        现代化、轻量级、高性能的 PHP 后端 API 框架。<br />
        A modern, lightweight, and high-performance backend API framework for PHP.
    `,
  buttons: [
    { text: "开始构建 →", href: "/guide/what-is-anon", theme: "brand" },
    { text: "探索 GitHub", href: "https://github.com/YuiNijika/anon", theme: "alt" },
  ],
};

const codeFiles = [
  {
    name: "路由与中间件",
    language: "php",
    code: String.raw`
<?php

use Anon\Core\Facade\Route;
use App\Controller\UserController;
use Anon\Core\Http\Middleware\Throttle;

// 注册带有前缀、中间件的路由组
Route::group(['prefix' => '/api/users', 'middleware' => Throttle::class], function ($route) {
    // 动态参数与控制器映射
    $route->get('/{id}', [UserController::class, 'show']);
    $route->post('/', [UserController::class, 'store']);
});
`,
  },
  {
    name: "表单验证请求",
    language: "php",
    code: String.raw`
<?php

namespace App\Http\Requests;

use Anon\Core\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool {
        return true; // 鉴权逻辑
    }

    public function rules(): array {
        return [
            'username' => 'required|min:4|max:20',
            'email'    => 'required|email',
            'password' => 'required|min:6'
        ];
    }
}
        `,
  },
  {
    name: "控制器与资源",
    language: "php",
    code: String.raw`
<?php

namespace App\Controller;

use App\Model\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;

class UserController
{
    // 自动依赖注入与表单验证
    public function store(StoreUserRequest $request)
    {
        // 验证通过，直接处理
        $user = User::create($request->post);
        
        // 自动转换模型数据并返回 JSON 响应
        return UserResource::make($user);
    }
}
`,
  },
];

const featuresSection = {
  title: "Why Anon Framework Next?",
  description: `摒弃繁重的历史包袱，采用现代化 PHP 架构特性，助力开发者快速构建可靠的后端服务。`,
};
</script>

<template>
  <div class="anon-home" :class="{ visible: isVisible }">
    <div class="bg-glow glow-left"></div>
    <div class="bg-glow glow-right"></div>

    <div class="container">
      <section class="hero">
        <div class="badge-group">
          <span v-for="(badge, index) in badges" :key="index" class="badge">
            {{ badge.icon }} <span class="badge-text">{{ badge.text }}</span>
          </span>
        </div>

        <h1 class="hero-title">
          <span class="title-gradient">{{ hero.title.gradient }}</span>
          <span class="title-plain">{{ hero.title.plain }}</span>
        </h1>

        <p class="hero-desc" v-html="hero.description"></p>

        <div class="tech-tags">
          <span v-for="(tech, index) in techStack" :key="index" class="tech-tag">
            {{ tech }}
          </span>
        </div>

        <div class="hero-buttons">
          <VPButton
            v-for="(btn, index) in hero.buttons"
            :key="index"
            tag="a"
            :text="btn.text"
            :href="btn.href"
            :theme="btn.theme"
            size="medium"
            class="custom-btn"
          />
        </div>
      </section>

      <section class="showcase">
        <div class="code-window">
          <div class="code-header">
            <div class="window-controls">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="tabs-header">
              <button
                v-for="file in codeFiles"
                :key="file.name"
                class="tab-button"
                :class="{ active: activeTab === file.name }"
                @click="switchTab(file.name)"
              >
                {{ file.name }}
              </button>
            </div>
            <div class="window-title">Anon Framework</div>
          </div>
          <div class="code-content">
            <div v-html="highlightedCode" class="code-block"></div>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="section-header">
          <h2 class="section-title">{{ featuresSection.title }}</h2>
          <p class="section-desc">{{ featuresSection.description }}</p>
        </div>

        <div class="features-grid">
          <div v-for="(feature, index) in features" :key="index" class="feature-card">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">{{ feature.icon }}</span>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.anon-home {
  position: relative;
  min-height: 100vh;
  background: var(--vp-c-bg);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--vp-font-family-base);
}

.anon-home.visible {
  opacity: 1;
  transform: translateY(0);
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  z-index: 10;
}

/* 极致的背景光晕 */
.bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}

.glow-left {
  top: -10%;
  left: -10%;
  background: var(--vp-c-brand);
}

.glow-right {
  top: 30%;
  right: -10%;
  background: #8b5cf6; /* 优雅的紫罗兰色作为点缀 */
}

/* --- Hero 区域 --- */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 140px 0 80px;
}

.badge-group {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  backdrop-filter: blur(10px);
  transition: border-color 0.3s ease;
}

.badge:hover {
  border-color: var(--vp-c-brand);
}

.badge-text {
  background: linear-gradient(120deg, var(--vp-c-text-1), var(--vp-c-text-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title {
  font-size: clamp(48px, 8vw, 84px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0 0 24px;
}

.title-gradient {
  background: linear-gradient(135deg, var(--vp-c-brand) 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-plain {
  color: var(--vp-c-text-1);
}

.hero-desc {
  font-size: clamp(18px, 2.5vw, 24px);
  line-height: 1.6;
  color: var(--vp-c-text-2);
  max-width: 700px;
  margin: 0 auto 40px;
  font-weight: 400;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 48px;
}

.tech-tag {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
}

.tech-tag:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.custom-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em;
}

/* --- Showcase 区域 (Code Window) --- */
.showcase {
  display: flex;
  justify-content: center;
  margin-bottom: 120px;
  perspective: 1000px;
}

.code-window {
  width: 100%;
  max-width: 900px;
  background: #111111; /* 保持暗色，确保代码高亮好看 */
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transform: rotateX(2deg) translateY(0);
  transition:
    transform 0.5s ease,
    box-shadow 0.5s ease;
}

.code-window:hover {
  transform: rotateX(0deg) translateY(-5px);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.code-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.window-controls {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.8;
}

.dot.red {
  background: #ff5f56;
}
.dot.yellow {
  background: #ffbd2e;
}
.dot.green {
  background: #27c93f;
}

.tabs-header {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-button {
  padding: 6px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #fff;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.window-title {
  text-align: right;
  font-size: 13px;
  color: #666;
  font-family: var(--vp-font-family-mono);
}

.code-content {
  padding: 24px;
  overflow-x: auto;
  background: transparent;
}

.code-block :deep(pre) {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

.code-block :deep(code) {
  font-family: "Fira Code", var(--vp-font-family-mono) !important;
}

/* --- 特性区域 (Features) --- */
.features {
  padding-bottom: 120px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: clamp(32px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
}

.section-desc {
  font-size: 18px;
  color: var(--vp-c-text-2);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 40px 32px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-card:hover {
  transform: translateY(-6px);
  border-color: var(--vp-c-brand);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  background: var(--vp-c-bg);
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-default-soft);
  border-radius: 12px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  background: var(--vp-c-brand-soft);
  transform: scale(1.1);
}

.feature-icon {
  font-size: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.feature-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

/* 响应式适配 */
@media (max-width: 968px) {
  .code-header {
    grid-template-columns: 1fr;
    gap: 16px;
    justify-content: center;
  }

  .window-controls {
    display: none; /* 移动端隐藏红绿灯 */
  }

  .window-title {
    display: none; /* 移动端隐藏标题 */
  }

  .tabs-header {
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .hero-title {
    font-size: 48px;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 100px 0 60px;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .feature-card {
    padding: 32px 24px;
  }
}
</style>
