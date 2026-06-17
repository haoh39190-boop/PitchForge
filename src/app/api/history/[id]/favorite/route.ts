import { cleanClientId, invalidClientIdResponse } from "@/lib/api/client-id";
import {
  isValidClientId,
  setScriptGenerationFavorite,
} from "@/lib/database/script-generations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const body = await request.json();
    const payload = typeof body === "object" && body !== null ? body : {};
    const source = payload as Record<string, unknown>;
    const clientId = cleanClientId(source.clientId);
    const isFavorite = Boolean(source.isFavorite);

    if (!isValidClientId(clientId)) {
      return invalidClientIdResponse();
    }

    const { id } = await context.params;
    const record = await setScriptGenerationFavorite(id, clientId, isFavorite);

    if (!record) {
      return Response.json(
        {
          success: false,
          error: {
            code: "HISTORY_NOT_FOUND",
            message: "没有找到这条历史记录。",
          },
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        record,
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "FAVORITE_UPDATE_FAILED",
          message: "收藏状态更新失败，请稍后重试。",
        },
      },
      { status: 500 }
    );
  }
}
