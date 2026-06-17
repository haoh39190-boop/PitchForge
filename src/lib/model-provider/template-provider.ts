import type { ModelProvider } from "./provider";
import type { SalesScriptInput, SalesScriptOutput } from "./types";

const stageStrategy: Record<string, string> = {
  首次咨询: "先降低客户决策压力，用开放问题确认预算、用途和换车时间。",
  对比竞品: "先承认对比是正常动作，再把关注点拆成可比较的维度。",
  邀约到店: "把沟通推进到可体验的动作，比如试驾、看车或确认到店时间。",
  价格谈判: "先承接价格敏感，再把预算边界、方案选择和价值点拆开聊。",
  临门一脚: "减少新信息堆叠，围绕最后顾虑和下一步确认推动成交动作。",
};

const focusAngles: Record<string, string> = {
  价格: "可以围绕预算边界、使用成本和可接受方案做沟通，但不要承诺具体优惠。",
  空间: "可以引导客户结合家庭人数、通勤和出行物品来判断空间是否匹配。",
  油耗: "可以围绕日常用车频率和长期使用成本展开，但不编造具体油耗数据。",
  配置: "可以把客户真正会用到的配置和使用场景对应起来，避免堆参数。",
  保值率: "可以提醒客户从品牌、车况、使用周期等维度理性评估，不做收益承诺。",
  金融方案: "可以先确认首付、月供压力和还款偏好，不承诺审批结果。",
  交付周期: "可以引导客户确认用车时间要求，不承诺具体库存或交付日期。",
};

const objectionResponses: Record<string, string> = {
  太贵: "您觉得价格有压力很正常，我们可以先把预算边界和必须配置分开看，避免只盯总价做判断。",
  还要对比: "多对比是理性的，我可以帮您把关注点整理成一张清单，这样比较不会只看单一价格。",
  家人不同意: "家人意见很关键，我们可以把他们最担心的点先列出来，再逐项确认是否有解决空间。",
  担心贷款压力: "贷款压力需要谨慎看，我建议先确认可接受月供范围，再判断方案是否合适。",
  暂时不急: "不着急也没关系，我们先把需求和预算确认清楚，后面有合适时间再推进体验。",
};

const toneOpeners: Record<string, string> = {
  专业: "我先帮您把这件事拆开看，",
  亲和: "我理解您的顾虑，咱们可以慢慢看，",
  强转化: "如果您想尽快判断是否合适，我建议我们先抓关键点，",
  克制稳重: "这个决定确实需要稳一点，",
};

function clean(value?: string) {
  return value?.trim() || "";
}

function pick(map: Record<string, string>, key?: string, fallback?: string) {
  const normalized = clean(key);
  return map[normalized] || fallback || "";
}

export class TemplateModelProvider implements ModelProvider {
  async generateSalesScript(input: SalesScriptInput): Promise<SalesScriptOutput> {
    const vehicleModel = clean(input.vehicleModel) || "示例车型";
    const budget = clean(input.budget);
    const stage = clean(input.customerStage) || "首次咨询";
    const focus = clean(input.customerFocus);
    const objection = clean(input.customerObjection);
    const tone = clean(input.tone) || "专业";
    const customInfo = clean(input.customInfo);

    const toneOpener = pick(toneOpeners, tone, "我先和您一起把情况梳理清楚，");
    const stageGuidance = pick(
      stageStrategy,
      stage,
      "先确认客户当前阶段，再匹配下一步沟通动作。"
    );
    const focusGuidance = pick(
      focusAngles,
      focus,
      "可以先确认客户最看重的因素，再围绕真实需求做价值匹配。"
    );
    const objectionGuidance = pick(
      objectionResponses,
      objection,
      "您的顾虑我理解，我们先把具体担心点说清楚，再判断哪些信息需要补充。"
    );

    const budgetText = budget
      ? `您提到的预算是“${budget}”，我会先把它当作沟通边界，不直接替您承诺价格或优惠。`
      : "目前预算还没有完全明确，建议先确认可接受的总预算或月供范围。";

    const focusText = focus
      ? `您现在更关注“${focus}”，这会影响我们介绍车型时的侧重点。`
      : "您还没有明确关注点，建议先问清楚客户最在意价格、空间、配置还是用车成本。";

    const objectionText = objection
      ? objectionGuidance
      : "客户异议还不明确，建议先追问一句：您现在最犹豫的是价格、对比车型，还是家人意见？";

    const customInfoText = customInfo
      ? `销售补充的信息是：“${customInfo}”。这部分可以作为沟通背景来追问和确认，但不要直接延展成价格、优惠、库存或金融承诺。`
      : "如果还有竞品、家人意见、用途或上次沟通背景，可以补充后再细化话术。";

    const opening = `【演示生成结果】${toneOpener}您现在看的是${vehicleModel}，处在“${stage}”阶段，我会先围绕您的真实顾虑来聊，不急着下结论。`;
    const needsConfirmation = `${budgetText} ${focusText} ${customInfoText} 我建议再确认三个点：主要用车场景、决定时间、还有谁会参与决策。`;
    const valueMatching = `${stageGuidance} ${focusGuidance} 如果“其他补充”里有客户特别在意的背景，优先把它转化为确认问题，而不是直接给确定结论。`;
    const objectionHandling = objectionText;
    const nextStep =
      "如果您方便，我建议下一步先约一个可执行动作：到店看车、安排试驾，或把您关心的几个点整理成对比清单。";
    const salesReminder =
      "销售提醒：当前为模板演示结果。其他补充只作为沟通背景，不作为事实承诺来源。不要承诺最低价、贷款一定通过、当天提车、具体优惠、库存或交付周期；如需引用参数和价格，请以门店实时信息为准。";

    const fullScript = [
      opening,
      "",
      needsConfirmation,
      "",
      valueMatching,
      "",
      objectionHandling,
      "",
      nextStep,
      "",
      salesReminder,
    ].join("\n");

    return {
      opening,
      needsConfirmation,
      valueMatching,
      objectionHandling,
      nextStep,
      fullScript,
      salesReminder,
    };
  }
}
