import { company } from '@/data/company';
import type { LocalizedList, LocalizedText } from './text';

/**
 * ============================================================================
 * COMPANY FACTS — localised presentation of the canonical record
 * ============================================================================
 * `data/company.ts` stays the single source of truth for every business
 * identifier. Nothing that must be exact is translated here:
 *
 *   phone        0638693614 (displayed 063 869 3614)
 *   email        pdablissoffice@gmail.com
 *   LINE         @593oiwec
 *   legal names  บริษัท พีดีเอ บลิส จำกัด / PDA BLISS COMPANY LIMITED
 *
 * Only the words around them are localised. No Chinese legal name is invented;
 * Chinese pages use the registered English name.
 *
 * OWNER REVIEW REQUIRED — English and Chinese renderings of the registered
 * address. The location is unchanged (14/14, Soi 21 off Krungthep–Nonthaburi
 * Road, Bang Sue, Bangkok 10800); only the romanisation and Chinese place
 * names are ours. Confirm against how the company writes its address on
 * English documents before using it on anything formal.
 * ============================================================================
 */

/** The registered name to show beside the Thai one, per locale. */
export const legalNameDisplay: LocalizedText = {
  th: company.legalNameTh,
  en: company.legalName,
  zh: company.legalName
};

export const addressLines: LocalizedList = {
  th: company.address.lines,
  en: [
    '14/14 Soi Krungthep-Nonthaburi 21',
    'Krungthep-Nonthaburi Road',
    'Bang Sue Subdistrict, Bang Sue District',
    'Bangkok 10800, Thailand'
  ],
  zh: ['泰国曼谷市 挽赐区 挽赐街道', '曼谷—暖武里路 21巷', '14/14号', '邮编 10800']
};

export const addressOneLine: LocalizedText = {
  th: company.addressOneLine,
  en: '14/14 Soi Krungthep-Nonthaburi 21, Krungthep-Nonthaburi Road, Bang Sue Subdistrict, Bang Sue District, Bangkok 10800, Thailand',
  zh: '泰国曼谷市挽赐区挽赐街道 曼谷—暖武里路21巷 14/14号，邮编 10800'
};

/** "Bangkok, Thailand" — used where the full address would crowd. */
export const addressNote: LocalizedText = {
  th: company.addressNote,
  en: 'Bangkok, Thailand',
  zh: '泰国曼谷'
};

/** Mon–Sat 08:30–17:30 in every locale — only the words change. */
export const businessHours = {
  days: { th: company.businessHours.days, en: 'Monday – Saturday', zh: '周一至周六' },
  time: { th: company.businessHours.time, en: '08:30 – 17:30', zh: '08:30 – 17:30' },
  note: { th: company.businessHours.note, en: 'We reply within 1 business day', zh: '1 个工作日内回复' }
} satisfies Record<string, LocalizedText>;

export const tagline: LocalizedText = {
  th: company.tagline,
  en: 'Turning your ideas into software that works in practice',
  zh: '把您的想法变成真正可用的软件'
};

export const description: LocalizedText = {
  th: company.description,
  en: 'Custom software, business systems, web applications, internal tools and automation, designed around how a business really works.',
  zh: '定制软件、企业业务系统、Web 应用、内部系统与自动化，均依据企业真实的工作流程设计。'
};
