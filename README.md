# PitchForge

PitchForge 是一个面向汽车销售场景的 AI 话术生成 Web MVP。销售填写客户信息、车型、预算、购车阶段、关注点、异议和补充背景后，系统生成结构化销售沟通话术，并把生成记录保存到 Neon PostgreSQL。

## 当前 MVP 范围

- Web 桌面端页面，优先适配 1280px、1440px、1920px。
- Landing Page、Dashboard、Demo Cases、History、Favorites。
- DeepSeek / EvoLink 生成销售话术。
- Neon PostgreSQL 保存生成记录、客户信息和收藏状态。
- 当前浏览器匿名 `clientId` 区分历史记录。
- 复制完整话术。
- 收藏 / 取消收藏话术。

## 当前阶段不做

- 不接 OpenAI API，不安装 OpenAI SDK。
- 不接 Google 登录。
- 不接 CRM、电话系统、库存系统或金融系统。
- 不编造真实车型参数、价格、优惠、库存、金融政策或交付周期。
- 暂不做移动端适配。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- lucide-react
- DeepSeek V4 Flash via EvoLink `/v1/messages`
- Neon PostgreSQL
- `pg`

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

检查命令：

```bash
npm run lint
npm run type-check
npm run build
```

## 环境变量

本地创建 `.env.local`：

```text
MODEL_PROVIDER=deepseek
DEEPSEEK_BASE_URL=https://direct.evolink.ai
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_API_KEY=your_api_key_here
DATABASE_URL=your_neon_database_url_here
```

`.env.local` 已在 `.gitignore` 中，不要提交真实 API Key 或数据库连接串。

## 生成接口

`POST /api/generate-script`

请求字段：

```ts
type SalesScriptInput = {
  customerName?: string;
  vehicleModel: string;
  budget?: string;
  customerStage: string;
  customerFocus?: string;
  customerObjection?: string;
  tone: string;
  customInfo?: string;
};
```

前端会额外传入匿名 `clientId`，服务端只把 `SalesScriptInput` 传给模型 Provider，并把生成结果保存到 Neon。

返回字段：

```ts
type SalesScriptOutput = {
  opening: string;
  needsConfirmation: string;
  valueMatching: string;
  objectionHandling: string;
  nextStep: string;
  fullScript: string;
  salesReminder: string;
};
```

成功响应：

```json
{
  "success": true,
  "data": {
    "output": {},
    "providerType": "deepseek",
    "record": {}
  }
}
```

失败响应：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请填写车型名称。"
  }
}
```

## 历史记录接口

```text
GET /api/history
GET /api/history/:id
PATCH /api/history/:id/favorite
DELETE /api/history/:id
GET /api/database-health
```

当前未接登录，接口通过浏览器本地保存的匿名 `clientId` 读取当前浏览器的历史记录。后续接入 Google 登录后，可以把 `clientId` 替换为真实用户 ID，并增加用户级权限隔离。

## Neon 数据表

当前自动创建 `script_generations` 表：

- `id`
- `client_id`
- `customer_name`
- `vehicle_model`
- `budget`
- `customer_stage`
- `customer_focus`
- `customer_objection`
- `tone`
- `custom_info`
- `input_payload`
- `generated_script`
- `provider_type`
- `is_favorite`
- `created_at`
- `updated_at`

## Provider 架构

话术生成能力通过统一接口封装：

```ts
interface ModelProvider {
  generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput>;
}
```

当前实现：

- `DeepSeekModelProvider`：默认使用，调用 EvoLink DeepSeek V4 Flash。
- `TemplateModelProvider`：保留为本地模板实现。
- `MockModelProvider`：保留为示例和兜底实现。

## 面试展示话术

PitchForge 不是泛聊天机器人，而是一个针对汽车销售沟通场景设计的 AI 工具。它把销售输入结构化，把模型输出约束成可复制、可追踪、可收藏的话术结果，并通过 Provider 架构隔离模型调用。当前版本已经接入 DeepSeek 和 Neon PostgreSQL，后续可以继续扩展登录、用户隔离、团队话术库和真实业务系统集成。
