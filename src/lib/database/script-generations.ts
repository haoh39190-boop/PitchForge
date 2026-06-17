import { randomUUID } from "node:crypto";
import type {
  ProviderType,
  SalesScriptInput,
  SalesScriptOutput,
} from "@/lib/model-provider";
import { getDatabasePool } from "./client";
import type { ScriptGenerationRecord } from "@/types/history";

type ScriptGenerationRow = {
  id: string;
  customer_name: string | null;
  vehicle_model: string;
  budget: string | null;
  customer_stage: string;
  customer_focus: string | null;
  customer_objection: string | null;
  tone: string;
  custom_info: string | null;
  input_payload: SalesScriptInput | string;
  generated_script: SalesScriptOutput | string;
  provider_type: ProviderType;
  is_favorite: boolean;
  created_at: Date | string;
};

type SaveScriptGenerationParams = {
  clientId: string;
  input: SalesScriptInput;
  output: SalesScriptOutput;
  providerType: ProviderType;
};

let tableReadyPromise: Promise<void> | null = null;

function normalizeJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function rowToRecord(row: ScriptGenerationRow): ScriptGenerationRecord {
  const inputPayload = normalizeJson<SalesScriptInput>(row.input_payload);
  const generatedScript = normalizeJson<SalesScriptOutput>(row.generated_script);

  return {
    id: row.id,
    input: {
      customerName: inputPayload.customerName ?? row.customer_name ?? "",
      vehicleModel: inputPayload.vehicleModel ?? row.vehicle_model,
      budget: inputPayload.budget ?? row.budget ?? "",
      customerStage: inputPayload.customerStage ?? row.customer_stage,
      customerFocus: inputPayload.customerFocus ?? row.customer_focus ?? "",
      customerObjection:
        inputPayload.customerObjection ?? row.customer_objection ?? "",
      tone: inputPayload.tone ?? row.tone,
      customInfo: inputPayload.customInfo ?? row.custom_info ?? "",
    },
    output: generatedScript,
    providerType: row.provider_type,
    isFavorite: row.is_favorite,
    createdAt: normalizeDate(row.created_at),
  };
}

export function isValidClientId(clientId: string) {
  return clientId.length > 0 && clientId.length <= 128;
}

export async function ensureScriptGenerationsTable() {
  if (!tableReadyPromise) {
    tableReadyPromise = getDatabasePool()
      .query(
        `
        create table if not exists script_generations (
          id uuid primary key,
          client_id text not null,
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
          provider_type text not null,
          is_favorite boolean not null default false,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        create index if not exists script_generations_client_created_idx
          on script_generations (client_id, created_at desc);

        create index if not exists script_generations_client_favorite_idx
          on script_generations (client_id, is_favorite, created_at desc);
        `
      )
      .then(() => undefined)
      .catch((error) => {
        tableReadyPromise = null;
        throw error;
      });
  }

  return tableReadyPromise;
}

export async function saveScriptGeneration({
  clientId,
  input,
  output,
  providerType,
}: SaveScriptGenerationParams) {
  await ensureScriptGenerationsTable();

  const id = randomUUID();
  const result = await getDatabasePool().query<ScriptGenerationRow>(
    `
    insert into script_generations (
      id,
      client_id,
      customer_name,
      vehicle_model,
      budget,
      customer_stage,
      customer_focus,
      customer_objection,
      tone,
      custom_info,
      input_payload,
      generated_script,
      provider_type
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13)
    returning
      id,
      customer_name,
      vehicle_model,
      budget,
      customer_stage,
      customer_focus,
      customer_objection,
      tone,
      custom_info,
      input_payload,
      generated_script,
      provider_type,
      is_favorite,
      created_at
    `,
    [
      id,
      clientId,
      input.customerName || null,
      input.vehicleModel,
      input.budget || null,
      input.customerStage,
      input.customerFocus || null,
      input.customerObjection || null,
      input.tone,
      input.customInfo || null,
      JSON.stringify(input),
      JSON.stringify(output),
      providerType,
    ]
  );

  return rowToRecord(result.rows[0]);
}

export async function listScriptGenerationRecords(
  clientId: string,
  options: { favoritesOnly?: boolean } = {}
) {
  await ensureScriptGenerationsTable();

  const result = await getDatabasePool().query<ScriptGenerationRow>(
    `
    select
      id,
      customer_name,
      vehicle_model,
      budget,
      customer_stage,
      customer_focus,
      customer_objection,
      tone,
      custom_info,
      input_payload,
      generated_script,
      provider_type,
      is_favorite,
      created_at
    from script_generations
    where client_id = $1
      and ($2::boolean = false or is_favorite = true)
    order by created_at desc
    limit 50
    `,
    [clientId, Boolean(options.favoritesOnly)]
  );

  return result.rows.map(rowToRecord);
}

export async function getScriptGenerationRecord(id: string, clientId: string) {
  await ensureScriptGenerationsTable();

  const result = await getDatabasePool().query<ScriptGenerationRow>(
    `
    select
      id,
      customer_name,
      vehicle_model,
      budget,
      customer_stage,
      customer_focus,
      customer_objection,
      tone,
      custom_info,
      input_payload,
      generated_script,
      provider_type,
      is_favorite,
      created_at
    from script_generations
    where id = $1 and client_id = $2
    limit 1
    `,
    [id, clientId]
  );

  return result.rows[0] ? rowToRecord(result.rows[0]) : null;
}

export async function setScriptGenerationFavorite(
  id: string,
  clientId: string,
  isFavorite: boolean
) {
  await ensureScriptGenerationsTable();

  const result = await getDatabasePool().query<ScriptGenerationRow>(
    `
    update script_generations
    set is_favorite = $3,
        updated_at = now()
    where id = $1 and client_id = $2
    returning
      id,
      customer_name,
      vehicle_model,
      budget,
      customer_stage,
      customer_focus,
      customer_objection,
      tone,
      custom_info,
      input_payload,
      generated_script,
      provider_type,
      is_favorite,
      created_at
    `,
    [id, clientId, isFavorite]
  );

  return result.rows[0] ? rowToRecord(result.rows[0]) : null;
}

export async function deleteScriptGenerationRecord(id: string, clientId: string) {
  await ensureScriptGenerationsTable();

  const result = await getDatabasePool().query(
    "delete from script_generations where id = $1 and client_id = $2",
    [id, clientId]
  );

  return (result.rowCount ?? 0) > 0;
}
