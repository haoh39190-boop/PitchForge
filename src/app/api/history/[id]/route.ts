import { getClientIdFromUrl, invalidClientIdResponse } from "@/lib/api/client-id";
import {
  deleteScriptGenerationRecord,
  getScriptGenerationRecord,
  isValidClientId,
} from "@/lib/database/script-generations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const clientId = getClientIdFromUrl(request);

  if (!isValidClientId(clientId)) {
    return invalidClientIdResponse();
  }

  try {
    const { id } = await context.params;
    const record = await getScriptGenerationRecord(id, clientId);

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
          code: "HISTORY_LOAD_FAILED",
          message: "历史详情读取失败，请稍后重试。",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const clientId = getClientIdFromUrl(request);

  if (!isValidClientId(clientId)) {
    return invalidClientIdResponse();
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteScriptGenerationRecord(id, clientId);

    if (!deleted) {
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
        deleted: true,
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "HISTORY_DELETE_FAILED",
          message: "历史记录删除失败，请稍后重试。",
        },
      },
      { status: 500 }
    );
  }
}
