# PitchForge

PitchForge 是面向汽车销售场景的 AI 话术生成与客户跟进工具。它帮助销售根据预设模板整理客户档案、生成结构化跟进话术、记录已使用的沟通内容，并沉淀个人常用话术。

## 核心能力

- 客户档案与销售阶段管理
- 根据客户情境生成跟进话术
- 话术编辑、改写与补充要求
- 可独立复制话术，并手动保存沟通记录
- 常用话术保存与复用
- 中文、英文切换
- 日间、夜间和跟随系统主题
- 浏览器本地数据保存

## 本地运行

在 `.env.local` 中配置模型服务：

```bash
DEEPSEEK_API_KEY="your-api-key"
DEEPSEEK_BASE_URL="https://direct.evolink.ai"
DEEPSEEK_MODEL="deepseek-v4-flash"
```

然后运行：

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 数据说明

PitchForge 当前将客户档案、沟通记录和常用话术保存在浏览器中：

- `pitchforge_customers`
- `pitchforge_communication_records`
- `pitchforge_saved_scripts`

清除网站数据或更换浏览器后，内容不会自动同步。

## 主要页面

- `/` 产品首页
- `/customers` 客户列表
- `/customers/[id]` 客户概览
- `/customers/[id]/script` 生成跟进话术
- `/customers/[id]/records` 沟通记录
- `/saved-scripts` 常用话术
- `/showcases` 跟进场景
- `/blog` 销售跟进指南
- `/updates` 产品更新
- `/docs` 使用文档

## License

See [LICENSE](./LICENSE).
