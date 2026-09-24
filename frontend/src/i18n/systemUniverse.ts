import type { BusinessSystem, SystemCategory } from '@/data/systemUniverse';
import type { Locale } from './locales';
import type { LocalizedText } from './text';
import type { ContentPack } from './content/types';

/**
 * ============================================================================
 * SYSTEM UNIVERSE — EN / ZH overlays for `data/systemUniverse.ts`
 * ============================================================================
 * Ids, connections (targets), positions, status and routes stay in the Thai
 * record. `name` replaces `nameTh` — the reader's-language name shown under
 * the English mono label — and connection labels are listed in the same order
 * as the Thai connections.
 *
 * As in Thai, connections describe flows PDA BLISS can design; no language
 * claims every product is already integrated in production.
 * ============================================================================
 */

export interface SystemText {
  name: string;
  shortDescription: string;
  capabilities: readonly string[];
  connections: readonly string[];
}

export function localizeSystem(system: BusinessSystem, pack: ContentPack | null): BusinessSystem {
  if (!pack) return system;
  const text = pack.systems[system.id];
  if (!text) return system;
  return {
    ...system,
    nameTh: text.name,
    shortDescription: text.shortDescription,
    capabilities: text.capabilities,
    connections: system.connections.map((connection, index) => ({
      ...connection,
      label: text.connections[index] ?? connection.label
    }))
  };
}

export const systemCategoryName: Record<SystemCategory, LocalizedText> = {
  operations: { th: 'ระบบงานธุรกิจ', en: 'Business operations', zh: '业务运营系统' },
  experience: { th: 'ช่องทางดิจิทัล', en: 'Digital channels', zh: '数字渠道' },
  data: { th: 'ข้อมูลและเอกสาร', en: 'Data & documents', zh: '数据与文档' }
};

export const universePreview = {
  title: { th: ['ระบบไม่ได้', 'ทำงานแยกกัน'], en: ['Systems do not', 'work in isolation'], zh: ['系统不是', '各自孤立运行的'] },
  body: {
    th: 'เราออกแบบซอฟต์แวร์ให้ข้อมูลและขั้นตอนของธุรกิจเชื่อมต่อกันได้ ตั้งแต่งานบุคคล เอกสาร สต็อก ไปจนถึงระบบหลังบ้าน',
    en: 'We design software so business data and processes connect — from HR and documents to stock and back-office systems.',
    zh: '我们设计的软件让业务数据和流程能够互相连接——从人事、文档、库存到后台系统。'
  },
  cta: { th: 'สำรวจระบบทั้งหมด', en: 'Explore all systems', zh: '了解全部系统' }
} satisfies Record<string, LocalizedText | Record<Locale, readonly string[]>>;
