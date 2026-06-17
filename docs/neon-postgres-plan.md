# Neon PostgreSQL 后续接入计划

当前阶段不接数据库。本文件只记录后续接入方案，避免第一阶段把演示闭环和真实账号体系混在一起。

## 目标

- 使用 Neon PostgreSQL 保存云端历史记录和收藏状态。
- 后续如需要账号体系，可使用 Auth.js / NextAuth + Google OAuth 完成登录。
- 用户只能访问自己的话术记录。
- 本地演示模式保留，便于未登录访客体验。

## 建议数据表

```sql
create table users (
  id text primary key,
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table script_generations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  customer_name text,
  vehicle_model text not null,
  budget text,
  customer_stage text not null,
  customer_focus text,
  customer_objection text,
  tone text not null,
  custom_info text,
  input_payload jsonb not null,
  generated_script jsonb not null,
  provider_type text not null default 'template',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index script_generations_user_created_idx
  on script_generations(user_id, created_at desc);
```

Auth.js / NextAuth adapter 需要的账号、会话和验证表应按所选 adapter 生成。

## 后续接口

- `GET /api/history`
- `GET /api/history/:id`
- `PATCH /api/history/:id/favorite`
- `DELETE /api/history/:id`

`POST /api/generate-script` 接入登录后，应在生成成功时保存到 `script_generations`。

## 环境变量

```text
DATABASE_URL=
```

不要提交 `.env.local`。
