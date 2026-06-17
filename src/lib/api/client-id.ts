export function cleanClientId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getClientIdFromUrl(request: Request) {
  return cleanClientId(new URL(request.url).searchParams.get("clientId"));
}

export function invalidClientIdResponse() {
  return Response.json(
    {
      success: false,
      error: {
        code: "CLIENT_ID_REQUIRED",
        message: "缺少客户端标识，请刷新页面后重试。",
      },
    },
    { status: 400 }
  );
}
