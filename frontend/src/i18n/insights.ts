import type { Insight } from '@/data/insights';
import type { Locale } from './locales';
import type { LocalizedText } from './text';
import type { ContentPack } from './content/types';

/**
 * ============================================================================
 * INSIGHTS — card framing only
 * ============================================================================
 * Every article is currently unpublished ("in preparation"); only its title
 * and one-line excerpt appear, so those are translated here.
 *
 * SCOPE DECISION — article BODIES are not translated. When an article is
 * published its body is written in the language it was authored in, and the
 * detail page shows that body as-is under a localised frame. Translating long
 * editorial copy belongs with the author, not in this overlay.
 *
 * Category names are English on every locale, as on the Thai page.
 * ============================================================================
 */

export interface InsightText {
  title: string;
  excerpt: string;
}

export function localizeInsight(insight: Insight, pack: ContentPack | null): Insight {
  if (!pack) return insight;
  const text = pack.insights[insight.slug];
  return text ? { ...insight, titleTh: text.title, excerpt: text.excerpt } : insight;
}

export const insightsPage = {
  title: { th: ['มองระบบธุรกิจ', 'ให้ชัดก่อนตัดสินใจ'], en: ['See your business systems', 'clearly before you decide'], zh: ['在做决定之前，', '先看清业务系统'] } as Record<Locale, readonly string[]>,
  lead: {
    th: 'แนวคิดสำหรับคนที่กำลังตัดสินใจเรื่องระบบธุรกิจ เนื้อหาฉบับเต็มจะเผยแพร่เมื่อเรียบเรียงและตรวจสอบครบแล้ว',
    en: 'Ideas for people making decisions about business systems. Full articles will be published once they have been written and reviewed.',
    zh: '写给正在为业务系统做决策的人。完整文章将在撰写并审核完成后发布。'
  } satisfies LocalizedText,
  minutes: { th: '{n} นาที', en: '{n} min read', zh: '{n} 分钟' } satisfies LocalizedText
};
