import { buildGenerationPlan } from './prompt';
import type {
  CommunicationChannel,
  CustomerStage,
  GenerationInput,
  ScriptSections,
  ScriptTone,
} from './types';

const zhStage: Record<CustomerStage, string> = {
  new_lead: '先了解需求，不急着做决定',
  following_up: '把上次沟通的重点继续聊透',
  visit_scheduled: '把到店时间和体验重点确认下来',
  negotiating: '把价格、配置和方案逐项说清楚',
  won: '确认交付安排和后续服务',
  paused: '尊重当前节奏，保留后续联系空间',
};

const enStage: Record<CustomerStage, string> = {
  new_lead: 'understand your needs without rushing a decision',
  following_up: 'continue from the most important points we discussed',
  visit_scheduled: 'confirm the visit time and what you want to experience',
  negotiating: 'make the pricing, trim, and purchase plan easy to compare',
  won: 'confirm delivery details and ongoing support',
  paused: 'respect your timing and keep the conversation open',
};

const zhChannel: Record<CommunicationChannel, string> = {
  phone: '我想占用您两分钟',
  wechat: '给您发一条简短消息',
  in_store: '我们可以现场一起核对',
  other: '想和您确认一下',
};

const enChannel: Record<CommunicationChannel, string> = {
  phone: 'I only need two minutes',
  wechat: 'I wanted to send a quick note',
  in_store: 'we can review it together in person',
  other: 'I wanted to check in',
};

const zhTone: Record<ScriptTone, string> = {
  professional: '清楚、专业地',
  friendly: '轻松一点',
  conversion: '更明确地推进下一步',
  steady: '稳妥地',
  wechat: '像日常微信一样自然地',
  phone_invite: '用适合电话邀约的方式',
};

const enTone: Record<ScriptTone, string> = {
  professional: 'clearly and professionally',
  friendly: 'in a relaxed and friendly way',
  conversion: 'with a clearer next step',
  steady: 'in a calm, considered way',
  wechat: 'in a natural message style',
  phone_invite: 'in a concise call-invitation style',
};

function fitChineseScript(value: string) {
  if (value.length > 200) {
    return `${value.slice(0, 198).replace(/[，。；、\s]+$/, '')}。`;
  }
  if (value.length < 120) {
    return `${value}我会根据您的实际需求准备对应信息，方便您更清楚地比较和决定。`;
  }
  return value;
}

function generateChinese(input: GenerationInput): ScriptSections {
  const plan = buildGenerationPlan(input);
  const variant = input.variant || 0;
  const openers = [
    `${plan.customerName}您好，${zhChannel[input.channel]}。`,
    `${plan.customerName}您好，我是之前和您沟通过的销售顾问，${zhChannel[input.channel]}。`,
    `${plan.customerName}您好，关于您关注的${plan.vehicle}，我想跟进一下。`,
  ];
  const opening = openers[variant % openers.length];
  const needsConfirmation = `您之前重点关注${plan.focus}，预算大约在${plan.budget}，我想确认一下，现在选车时这两点是否仍然最重要？`;
  const objectionHandling = `关于“${plan.objection}”这个顾虑，我建议先不急着比较结论，我们可以结合您的实际用车场景，把配置差异、使用成本和适合程度逐项看清楚。`;
  const extra = plan.extraContext
    ? `另外您提到的“${plan.extraContext}”，我也会提前整理好对应信息。`
    : '';
  const gentle = plan.isGentle ? '您方便时回复我就好，' : '';
  const direct = plan.isDirect
    ? '如果方向合适，我建议今天先把下一步定下来，'
    : '';
  const nextStep = `${gentle}${direct}接下来我们可以${zhStage[input.stage]}。您看今天晚些时候，还是明天方便继续沟通？`;
  const detailedScript = [
    opening,
    `我想${zhTone[input.tone]}和您确认一下：${needsConfirmation}`,
    objectionHandling,
    extra,
    nextStep,
  ]
    .filter(Boolean)
    .join('');
  const compactScript = `${opening}${needsConfirmation}${objectionHandling}${nextStep}`;
  const fullScript = fitChineseScript(
    plan.isBrief || detailedScript.length > 200 ? compactScript : detailedScript
  );

  return {
    opening,
    needsConfirmation,
    objectionHandling,
    nextStep,
    fullScript,
    salesReminder:
      '先确认客户当前关注点，再给出具体下一步，避免承诺未核实的信息。',
    providerType: 'template',
  };
}

function generateEnglish(input: GenerationInput): ScriptSections {
  const plan = buildGenerationPlan(input);
  const variant = input.variant || 0;
  const openers = [
    `Hi ${plan.customerName}, ${enChannel[input.channel]}.`,
    `Hi ${plan.customerName}, this is the sales advisor you spoke with earlier.`,
    `Hi ${plan.customerName}, I wanted to follow up on the ${plan.vehicle}.`,
  ];
  const opening = openers[variant % openers.length];
  const needsConfirmation = `You previously focused on ${plan.focus}, with a budget around ${plan.budget}. Are those still the two most important points in your decision?`;
  const objectionHandling = `On your concern about “${plan.objection},” there is no need to force a conclusion. We can compare the relevant trim, ownership cost, and practical fit against how you will actually use the car.`;
  const extra = plan.extraContext
    ? `I will also prepare details about “${plan.extraContext}” before we speak.`
    : '';
  const nextStep = `${plan.isGentle ? 'Whenever it is convenient, ' : ''}${
    plan.isDirect
      ? 'if the direction feels right, let us confirm the next step today. '
      : ''
  }The next step is to ${enStage[input.stage]}. Would later today or tomorrow work better?`;
  const fullScript = [
    opening,
    `I would like to follow up ${enTone[input.tone]}.`,
    needsConfirmation,
    objectionHandling,
    extra,
    nextStep,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    opening,
    needsConfirmation,
    objectionHandling,
    nextStep,
    fullScript,
    salesReminder:
      'Confirm the customer’s current priority before proposing the next step. Do not promise unverified details.',
    providerType: 'template',
  };
}

export function generateTemplateScript(input: GenerationInput) {
  return input.locale.startsWith('zh')
    ? generateChinese(input)
    : generateEnglish(input);
}
