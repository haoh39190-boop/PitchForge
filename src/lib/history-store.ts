"use client";

import type {
  ApiResponse,
  GenerateScriptData,
  SalesScriptInput,
} from "@/lib/model-provider";
import type { ScriptGenerationRecord } from "@/types/history";

const CLIENT_ID_KEY = "pitchforge.client_id.v1";

type RecordsData = {
  records: ScriptGenerationRecord[];
};

type RecordData = {
  record: ScriptGenerationRecord;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getHistoryClientId() {
  if (!isBrowser()) {
    return "";
  }

  const existing = window.localStorage.getItem(CLIENT_ID_KEY);

  if (existing) {
    return existing;
  }

  const nextId = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(CLIENT_ID_KEY, nextId);

  return nextId;
}

async function parseApiResponse<T>(response: Response) {
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export async function generateScriptRecord(input: SalesScriptInput) {
  const response = await fetch("/api/generate-script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      clientId: getHistoryClientId(),
    }),
  });
  const data = await parseApiResponse<GenerateScriptData>(response);

  if (!data.record) {
    throw new Error("生成结果保存失败，请稍后重试。");
  }

  return data.record;
}

export async function getHistoryRecords(options: { favoritesOnly?: boolean } = {}) {
  const clientId = getHistoryClientId();
  const params = new URLSearchParams({ clientId });

  if (options.favoritesOnly) {
    params.set("favorite", "true");
  }

  const response = await fetch(`/api/history?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await parseApiResponse<RecordsData>(response);

  return data.records;
}

export async function getHistoryRecord(id: string) {
  const params = new URLSearchParams({ clientId: getHistoryClientId() });
  const response = await fetch(`/api/history/${id}?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await parseApiResponse<RecordData>(response);

  return data.record;
}

export async function setFavorite(id: string, isFavorite: boolean) {
  const response = await fetch(`/api/history/${id}/favorite`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: getHistoryClientId(),
      isFavorite,
    }),
  });
  const data = await parseApiResponse<RecordData>(response);

  return data.record;
}

export async function deleteHistoryRecord(id: string) {
  const params = new URLSearchParams({ clientId: getHistoryClientId() });
  const response = await fetch(`/api/history/${id}?${params.toString()}`, {
    method: "DELETE",
  });

  await parseApiResponse<{ deleted: boolean }>(response);
  return getHistoryRecords();
}
