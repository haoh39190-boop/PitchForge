---
name: model-provider
description: 用于 PitchForge 的模型服务抽象层设计。当前阶段不绑定 OpenAI API，先使用 Mock Provider 或 Template Provider，后续可替换为 OpenAI、Claude、DeepSeek、通义、本地模型或公司内部模型。
---

你是资深 AI 应用架构师和全栈工程师。

当前项目是 PitchForge。

PitchForge 是一个面向汽车销售场景的 AI 话术生成工具，用于根据车型、客户预算、购车阶段、客户关注点和客户异议，生成结构化销售沟通话术。

重要约束：
- 当前阶段暂不接入 OpenAI API。
- 不要在代码中写死任何具体模型厂商。
- 不要默认使用 OpenAI SDK。
- 不要要求用户现在配置 OPENAI_API_KEY。
- 模型调用层必须可替换。
- 第一阶段允许使用 Mock Provider 或 Template Provider 生成话术。
- 后续可以平滑替换为真实模型 API。

设计目标：
将“话术生成能力”封装成统一接口，让业务层不关心底层使用哪个模型。

推荐架构：
1. 定义统一输入类型 SalesScriptInput
2. 定义统一输出类型 SalesScriptOutput
3. 定义 ModelProvider 接口
4. 实现 MockModelProvider
5. 实现 TemplateModelProvider
6. 预留 FutureApiModelProvider
7. 后端生成接口只调用统一 provider，不直接调用具体模型 SDK

推荐目录：
src/
├─ lib/
│  └─ model-provider/
│     ├─ types.ts
│     ├─ provider.ts
│     ├─ mock-provider.ts
│     ├─ template-provider.ts
│     └─ index.ts

推荐输入类型：
type SalesScriptInput = {
  vehicleModel: string;
  budget?: string;
  customerStage: string;
  customerFocus?: string;
  customerObjection?: string;
  tone: string;
};

推荐输出类型：
type SalesScriptOutput = {
  opening: string;
  needsConfirmation: string;
  valueMatching: string;
  objectionHandling: string;
  nextStep: string;
  fullScript: string;
  salesReminder: string;
};

推荐接口：
interface ModelProvider {
  generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput>;
}

第一阶段生成方式：
- 优先使用 TemplateModelProvider
- 根据客户阶段、关注点、异议、语气风格拼接结构化话术
- 明确标记为“演示生成结果”
- 不编造车型参数、价格、优惠、金融政策、库存、交付周期
- 不产生真实模型调用费用

输出要求：
1. 保持结构化输出
2. 不生成虚假承诺
3. 不使用真实模型 API
4. 不产生额外费用
5. 后续接入真实模型时，只替换 provider 实现，不改前端和业务接口

当需要接入真实模型时：
1. 新增具体 provider
2. 在环境变量中配置 provider 类型
3. 保持 API 返回结构不变
4. 保持前端展示逻辑不变
5. 补充错误处理和超时处理
6. 不要影响现有 Mock / Template Provider
