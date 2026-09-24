import { createElement, Fragment, type ReactNode } from 'react';

/**
 * Fills `{name}` slots in a localised template.
 *
 * Word order differs between Thai, English and Chinese ("ดูผลงาน 7 โครงการที่
 * หน้าผลงาน" / "see 7 projects on the Work page" / "在案例页面中查看 7 个项目"),
 * so a sentence with a number or a link inside it is written whole per
 * locale rather than glued together from fragments.
 *
 *   fill('Or see {n} projects on the {link}.', { n: 7, link: <Link …/> })
 */
export function fill(template: string, slots: Record<string, ReactNode>): ReactNode {
  const parts = template.split(/(\{\w+\})/g).filter((part) => part !== '');
  return createElement(
    Fragment,
    null,
    ...parts.map((part, index) => {
      const match = /^\{(\w+)\}$/.exec(part);
      const value = match?.[1] !== undefined && match[1] in slots ? slots[match[1]] : part;
      return createElement(Fragment, { key: index }, value);
    })
  );
}

/** The same, for plain text (titles, aria labels). */
export function fillText(template: string, slots: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in slots ? String(slots[name]) : whole));
}
