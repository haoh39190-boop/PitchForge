export type ProviderType = "template" | "mock" | "deepseek";

export type SalesScriptInput = {
  customerName?: string;
  vehicleModel: string;
  budget?: string;
  customerStage: string;
  customerFocus?: string;
  customerObjection?: string;
  tone: string;
  customInfo?: string;
};

export type SalesScriptOutput = {
  opening: string;
  needsConfirmation: string;
  valueMatching: string;
  objectionHandling: string;
  nextStep: string;
  fullScript: string;
  salesReminder: string;
};

export type GenerateScriptData = {
  output: SalesScriptOutput;
  providerType: ProviderType;
  record?: {
    id: string;
    input: SalesScriptInput;
    output: SalesScriptOutput;
    providerType: ProviderType;
    isFavorite: boolean;
    createdAt: string;
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
