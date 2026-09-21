export type SystemCategory = 'operations' | 'experience' | 'data';

export type SystemIcon =
  | 'erp'
  | 'payroll'
  | 'hr'
  | 'documents'
  | 'storage'
  | 'webapp'
  | 'mobile'
  | 'website';

export type SystemStatus = 'available-solution' | 'custom-development';

export interface SystemConnection {
  targetId: string;
  /** Short, factual reason for drawing this connection. */
  label: string;
}

export interface BusinessSystem {
  id: string;
  nameTh: string;
  nameEn: string;
  shortDescription: string;
  capabilities: readonly string[];
  category: SystemCategory;
  connections: readonly SystemConnection[];
  status: SystemStatus;
  route: string;
  icon: SystemIcon;
  /** Percentage coordinates used by the desktop topology only. */
  position: { x: number; y: number };
}

export const systemCategories: Record<SystemCategory, { nameTh: string; nameEn: string }> = {
  operations: { nameTh: 'ระบบงานธุรกิจ', nameEn: 'BUSINESS OPERATIONS' },
  experience: { nameTh: 'ช่องทางดิจิทัล', nameEn: 'DIGITAL EXPERIENCE' },
  data: { nameTh: 'ข้อมูลและเอกสาร', nameEn: 'DATA & DOCUMENT' }
};

/**
 * Public capability map. Connections describe flows PDA BLISS can design;
 * they do not claim every product is already integrated in production.
 */
export const businessSystems: readonly BusinessSystem[] = [
  {
    id: 'erp',
    nameTh: 'ระบบบริหารธุรกิจ',
    nameEn: 'ERP',
    shortDescription: 'รวมงานสต็อก ต้นทุน จัดซื้อ และรายงานให้อยู่บนข้อมูลธุรกิจชุดเดียวกัน',
    capabilities: ['สต็อกและคลังสินค้า', 'ต้นทุน', 'จัดซื้อ', 'รายงานธุรกิจ'],
    category: 'operations',
    connections: [
      { targetId: 'documents', label: 'เอกสารประกอบรายการธุรกิจ' },
      { targetId: 'webapp', label: 'หน้าจอทำงานสำหรับทีมภายใน' }
    ],
    status: 'custom-development',
    route: '/services#business-systems',
    icon: 'erp',
    position: { x: 49, y: 13 }
  },
  {
    id: 'payroll',
    nameTh: 'ระบบบริหารเงินเดือน',
    nameEn: 'PAYROLL',
    shortDescription: 'จัดการข้อมูลพนักงาน เวลาทำงาน และการคำนวณเงินเดือนอย่างเป็นขั้นตอน',
    capabilities: ['ข้อมูลพนักงาน', 'เวลาทำงานและวันลา', 'คำนวณเงินเดือน', 'รายงาน'],
    category: 'operations',
    connections: [{ targetId: 'hr-line-bot', label: 'ส่งคำขอและผลอนุมัติเข้าสู่งานบุคคล' }],
    status: 'available-solution',
    route: '/services#payroll',
    icon: 'payroll',
    position: { x: 79, y: 25 }
  },
  {
    id: 'hr-line-bot',
    nameTh: 'ระบบ HR ผ่าน LINE',
    nameEn: 'HR LINE BOT',
    shortDescription: 'ให้พนักงานส่งคำขอและให้หัวหน้าดำเนินการอนุมัติผ่านช่องทางที่คุ้นเคย',
    capabilities: ['คำขอของพนักงาน', 'วันลา', 'การอนุมัติ', 'การแจ้งเตือน'],
    category: 'operations',
    connections: [],
    status: 'available-solution',
    route: '/services#hr-line-bot',
    icon: 'hr',
    position: { x: 87, y: 58 }
  },
  {
    id: 'documents',
    nameTh: 'ระบบเอกสาร',
    nameEn: 'DOCUMENTS',
    shortDescription: 'จัดเก็บ ค้นหา และส่งเอกสารตามขั้นตอนการทำงานขององค์กร',
    capabilities: ['จัดหมวดหมู่', 'ค้นหาและเรียกดู', 'กำหนดสิทธิ์', 'ขั้นตอนอนุมัติ'],
    category: 'data',
    connections: [{ targetId: 'nas-files', label: 'ใช้พื้นที่จัดเก็บไฟล์เป็นแหล่งข้อมูลกลาง' }],
    status: 'custom-development',
    route: '/services#document-management',
    icon: 'documents',
    position: { x: 72, y: 85 }
  },
  {
    id: 'nas-files',
    nameTh: 'ระบบจัดเก็บไฟล์',
    nameEn: 'NAS / FILES',
    shortDescription: 'รวมไฟล์ขององค์กรไว้เป็นสัดส่วน เพื่อให้เข้าถึงและค้นคืนได้ตามสิทธิ์',
    capabilities: ['พื้นที่จัดเก็บกลาง', 'หมวดหมู่ไฟล์', 'สิทธิ์การเข้าถึง', 'ค้นคืนเอกสาร'],
    category: 'data',
    connections: [],
    status: 'available-solution',
    route: '/services#document-management',
    icon: 'storage',
    position: { x: 35, y: 88 }
  },
  {
    id: 'webapp',
    nameTh: 'เว็บแอปพลิเคชัน',
    nameEn: 'WEB APPLICATION',
    shortDescription: 'เปลี่ยนขั้นตอนทำงานภายในให้เป็นระบบที่ทีมเข้าถึงและติดตามงานร่วมกันได้',
    capabilities: ['ระบบหลังบ้าน', 'ขั้นตอนการทำงาน', 'สิทธิ์ผู้ใช้', 'เชื่อมข้อมูลธุรกิจ'],
    category: 'experience',
    connections: [{ targetId: 'mobile-app', label: 'ใช้กระบวนการธุรกิจร่วมกันข้ามอุปกรณ์' }],
    status: 'custom-development',
    route: '/services#web-applications',
    icon: 'webapp',
    position: { x: 11, y: 68 }
  },
  {
    id: 'mobile-app',
    nameTh: 'โมบายแอปพลิเคชัน',
    nameEn: 'MOBILE APPLICATION',
    shortDescription: 'นำขั้นตอนที่ต้องใช้งานระหว่างเดินทางหรือหน้างานมาอยู่บนอุปกรณ์มือถือ',
    capabilities: ['ประสบการณ์บนมือถือ', 'งานหน้างาน', 'การแจ้งเตือน', 'เชื่อมระบบหลังบ้าน'],
    category: 'experience',
    connections: [],
    status: 'custom-development',
    route: '/services#mobile-applications',
    icon: 'mobile',
    position: { x: 12, y: 32 }
  },
  {
    id: 'website',
    nameTh: 'เว็บไซต์',
    nameEn: 'WEBSITE',
    shortDescription: 'สร้างช่องทางสาธารณะที่สื่อสารบริการและพาผู้ใช้งานไปยังขั้นตอนดิจิทัลที่เกี่ยวข้อง',
    capabilities: ['เว็บไซต์องค์กร', 'เนื้อหาและบริการ', 'รองรับมือถือ', 'ช่องทางติดต่อ'],
    category: 'experience',
    connections: [{ targetId: 'webapp', label: 'ส่งต่อจากช่องทางสาธารณะสู่บริการออนไลน์' }],
    status: 'custom-development',
    route: '/services#websites',
    icon: 'website',
    position: { x: 27, y: 12 }
  }
] as const;

export const systemStatusLabels: Record<SystemStatus, string> = {
  'available-solution': 'AVAILABLE SOLUTION',
  'custom-development': 'CUSTOM DEVELOPMENT'
};

export interface SystemEdge {
  from: string;
  to: string;
  label: string;
}

export const systemEdges: readonly SystemEdge[] = businessSystems.flatMap((system) =>
  system.connections.map((connection) => ({
    from: system.id,
    to: connection.targetId,
    label: connection.label
  }))
);

export function getConnectedSystemIds(systemId: string): string[] {
  const connected = new Set<string>();
  systemEdges.forEach((edge) => {
    if (edge.from === systemId) connected.add(edge.to);
    if (edge.to === systemId) connected.add(edge.from);
  });
  return [...connected];
}

export function getSystemById(systemId: string): BusinessSystem | undefined {
  return businessSystems.find((system) => system.id === systemId);
}
