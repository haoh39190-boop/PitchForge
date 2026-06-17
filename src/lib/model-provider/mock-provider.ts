import type { ModelProvider } from "./provider";
import type { SalesScriptInput, SalesScriptOutput } from "./types";

export class MockModelProvider implements ModelProvider {
  async generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput> {
    const vehicleModel = input.vehicleModel?.trim() || "示例：某新能源 SUV";
    const customInfo = input.customInfo?.trim();
    const customInfoLine = customInfo
      ? `\n\n我也会把您补充的“${customInfo}”当作沟通背景来确认，但不会据此承诺价格、优惠、库存或金融结果。`
      : "";

    return {
      opening: `【演示生成结果】您关注${vehicleModel}，我先不急着推荐配置，先帮您把预算、用途和顾虑拆清楚。`,
      needsConfirmation:
        `我想先确认三个信息：这台车主要谁开、日常通勤还是家庭出行更多、目前预算边界大概在哪里。${customInfoLine}`,
      valueMatching:
        "如果您更看重长期使用体验，我们可以先围绕空间、用车成本和实际会用到的配置来判断是否匹配。",
      objectionHandling:
        "如果您还想继续对比，我建议我们把竞品差异整理成清单，而不是只看单一价格，这样判断会更稳。",
      nextStep:
        "下一步可以先约一次到店看车或试驾，实际坐进去体验后，再决定要不要继续谈具体方案。",
      fullScript:
        `【演示生成结果】您关注这台车，我先不急着推荐配置，先帮您把预算、用途和顾虑拆清楚。\n\n我想先确认三个信息：这台车主要谁开、日常通勤还是家庭出行更多、目前预算边界大概在哪里。${customInfoLine}\n\n如果您更看重长期使用体验，我们可以先围绕空间、用车成本和实际会用到的配置来判断是否匹配。\n\n如果您还想继续对比，我建议我们把竞品差异整理成清单，而不是只看单一价格，这样判断会更稳。\n\n下一步可以先约一次到店看车或试驾，实际坐进去体验后，再决定要不要继续谈具体方案。\n\n销售提醒：当前为 Mock 演示结果，不包含真实价格、优惠、库存、金融政策或交付周期。`,
      salesReminder:
        "销售提醒：当前为 Mock 演示结果，不包含真实价格、优惠、库存、金融政策或交付周期。",
    };
  }
}
