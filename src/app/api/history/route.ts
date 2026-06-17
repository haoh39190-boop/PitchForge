import { getClientIdFromUrl, invalidClientIdResponse } from "@/lib/api/client-id";
import {
  isValidClientId,
  listScriptGenerationRecords,
} from "@/lib/database/script-generations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = getClientIdFromUrl(request);

  if (!isValidClientId(clientId)) {
    return invalidClientIdResponse();
  }

  try {
    const url = new URL(request.url);
    const records = await listScriptGenerationRecords(clientId, {
      favoritesOnly: url.searchParams.get("favorite") === "true",
    });

    return Response.json({
      success: true,
      data: {
        records,
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "HISTORY_LOAD_FAILED",
          message: "历史记录读取失败，请稍后重试。",
        },
      },
      { status: 500 }
    );
  }
}
