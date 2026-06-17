import type { SalesScriptInput, SalesScriptOutput } from "./types";

export interface ModelProvider {
  generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput>;
}
