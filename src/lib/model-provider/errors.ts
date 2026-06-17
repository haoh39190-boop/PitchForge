export class ModelProviderError extends Error {
  constructor(
    message: string,
    public readonly code = "MODEL_PROVIDER_ERROR",
    public readonly status = 500
  ) {
    super(message);
    this.name = "ModelProviderError";
  }
}
