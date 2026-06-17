import type { SalesScriptInput } from "@/lib/model-provider";

export type DemoCase = {
  id: string;
  title: string;
  scene: string;
  input: SalesScriptInput;
};

export const demoCases: DemoCase[] = [
  {
    id: "price-sensitive",
    title: "示例：客户觉得价格偏高",
    scene: "价格谈判阶段，客户说还想看看有没有更合适的方案。",
    input: {
      customerName: "示例：王女士",
      vehicleModel: "示例：某新能源 SUV",
      budget: "示例：20 万以内",
      customerStage: "价格谈判",
      customerFocus: "价格",
      customerObjection: "太贵",
      tone: "克制稳重",
      customInfo: "客户上次提到周末可能到店，但希望先确认预算压力。",
    },
  },
  {
    id: "compare-competitor",
    title: "示例：客户正在对比竞品",
    scene: "客户同时看了两款车，不想过早决定。",
    input: {
      customerName: "示例：李先生",
      vehicleModel: "示例：某家用 MPV",
      budget: "示例：25 万左右",
      customerStage: "对比竞品",
      customerFocus: "空间",
      customerObjection: "还要对比",
      tone: "专业",
      customInfo: "客户家里有两位老人，经常周末短途出行。",
    },
  },
  {
    id: "family-concern",
    title: "示例：家人还没有同意",
    scene: "客户本人感兴趣，但家人担心后续使用成本。",
    input: {
      customerName: "示例：陈女士",
      vehicleModel: "示例：某混动车型",
      budget: "示例：18 到 22 万",
      customerStage: "临门一脚",
      customerFocus: "油耗",
      customerObjection: "家人不同意",
      tone: "亲和",
      customInfo: "客户本人认可车型，但配偶更关心后续用车成本。",
    },
  },
  {
    id: "loan-pressure",
    title: "示例：担心贷款压力",
    scene: "客户希望分期，但担心月供影响生活质量。",
    input: {
      customerName: "示例：赵先生",
      vehicleModel: "示例：某纯电轿车",
      budget: "示例：月供不超过 4000",
      customerStage: "首次咨询",
      customerFocus: "金融方案",
      customerObjection: "担心贷款压力",
      tone: "克制稳重",
      customInfo: "客户希望先了解可承受范围，再决定是否到店试驾。",
    },
  },
];

export function findDemoCase(id: string | null) {
  if (!id) {
    return null;
  }

  return demoCases.find((demoCase) => demoCase.id === id) || null;
}
