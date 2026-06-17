import { checkDatabaseConnection } from "@/lib/database/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checkedAt = await checkDatabaseConnection();

    return Response.json({
      success: true,
      data: {
        status: "connected",
        checkedAt: checkedAt?.toISOString() ?? null,
      },
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "DATABASE_CONNECTION_ERROR",
          message: "数据库连接失败，请检查 DATABASE_URL 或 Neon 数据库状态。",
        },
      },
      { status: 500 }
    );
  }
}
