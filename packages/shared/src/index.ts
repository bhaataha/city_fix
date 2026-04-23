// ============================================================
// CityFix Shared Types & Constants
// ============================================================

// ─── Issue Categories (Default Set) ─────────────────────

export const DEFAULT_CATEGORIES = [
  { name: 'בור בכביש', nameEn: 'Pothole', nameAr: 'حفرة في الطريق', icon: 'road', color: '#EF4444' },
  { name: 'פנס רחוב תקול', nameEn: 'Broken Streetlight', nameAr: 'إنارة شارع معطلة', icon: 'lightbulb', color: '#F59E0B' },
  { name: 'פסולת / גזם', nameEn: 'Waste / Debris', nameAr: 'نفايات / أنقاض', icon: 'trash', color: '#10B981' },
  { name: 'מפגע בטיחות', nameEn: 'Safety Hazard', nameAr: 'خطر أمان', icon: 'alert-triangle', color: '#DC2626' },
  { name: 'מדרכה שבורה', nameEn: 'Broken Sidewalk', nameAr: 'رصيف مكسور', icon: 'footprints', color: '#8B5CF6' },
  { name: 'ניקוז / הצפה', nameEn: 'Drainage / Flooding', nameAr: 'صرف / فيضان', icon: 'droplets', color: '#3B82F6' },
  { name: 'תמרור / רמזור', nameEn: 'Sign / Traffic Light', nameAr: 'إشارة مرور', icon: 'traffic-cone', color: '#F97316' },
  { name: 'מפגע בגינה ציבורית', nameEn: 'Park Hazard', nameAr: 'خطر في الحديقة العامة', icon: 'trees', color: '#22C55E' },
  { name: 'חניה / רכב נטוש', nameEn: 'Parking / Abandoned Vehicle', nameAr: 'مركبة مهجورة', icon: 'car', color: '#6366F1' },
  { name: 'ונדליזם', nameEn: 'Vandalism', nameAr: 'تخريب', icon: 'shield-alert', color: '#EC4899' },
  { name: 'כלב משוטט / מפגע תברואתי', nameEn: 'Stray Dog / Sanitation', nameAr: 'كلب ضال / مشكلة صحية', icon: 'bug', color: '#14B8A6' },
  { name: 'תשתיות מים / ביוב', nameEn: 'Water / Sewage', nameAr: 'مياه / صرف صحي', icon: 'waves', color: '#0EA5E9' },
  { name: 'בעיית נגישות', nameEn: 'Accessibility Issue', nameAr: 'مشكلة وصول', icon: 'accessibility', color: '#A855F7' },
] as const;

// ─── Status Labels (Hebrew) ─────────────────────────────

export const ISSUE_STATUS_LABELS: Record<string, { he: string; en: string; ar: string }> = {
  NEW: { he: 'חדש', en: 'New', ar: 'جديد' },
  PENDING_VERIFICATION: { he: 'ממתין לאימות', en: 'Pending Verification', ar: 'بانتظار التحقق' },
  ASSIGNED: { he: 'הועבר למחלקה', en: 'Assigned', ar: 'تم التعيين' },
  IN_PROGRESS: { he: 'בטיפול', en: 'In Progress', ar: 'قيد المعالجة' },
  INSPECTION_SCHEDULED: { he: 'נקבעה בדיקה', en: 'Inspection Scheduled', ar: 'تم جدولة الفحص' },
  WAITING_CONTRACTOR: { he: 'ממתין לקבלן', en: 'Waiting for Contractor', ar: 'بانتظار المقاول' },
  RESOLVED: { he: 'טופל', en: 'Resolved', ar: 'تم الحل' },
  CLOSED: { he: 'נסגר', en: 'Closed', ar: 'مغلق' },
  REJECTED: { he: 'נדחה', en: 'Rejected', ar: 'مرفوض' },
  NOT_RESPONSIBLE: { he: 'לא באחריות הרשות', en: 'Not Responsible', ar: 'ليس من مسؤولية السلطة' },
  DUPLICATE: { he: 'כפול / מוזג', en: 'Duplicate', ar: 'مكرر' },
};

export const URGENCY_LABELS: Record<string, { he: string; en: string; color: string }> = {
  LOW: { he: 'נמוכה', en: 'Low', color: '#6B7280' },
  NORMAL: { he: 'רגילה', en: 'Normal', color: '#3B82F6' },
  HIGH: { he: 'גבוהה', en: 'High', color: '#F59E0B' },
  CRITICAL: { he: 'קריטי', en: 'Critical', color: '#EF4444' },
};

// ─── Role Labels ────────────────────────────────────────

export const ROLE_LABELS: Record<string, { he: string; en: string }> = {
  RESIDENT: { he: 'תושב', en: 'Resident' },
  CALL_CENTER: { he: 'מוקדן', en: 'Call Center' },
  DEPT_MANAGER: { he: 'מנהל מחלקה', en: 'Department Manager' },
  FIELD_WORKER: { he: 'עובד שטח', en: 'Field Worker' },
  LEGAL: { he: 'משפטי', en: 'Legal' },
  INSURANCE: { he: 'ביטוח', en: 'Insurance' },
  ADMIN: { he: 'מנהל רשות', en: 'Admin' },
  SUPER_ADMIN: { he: 'מנהל מערכת', en: 'Super Admin' },
};

// ─── Helpers ────────────────────────────────────────────

export function generateReportNumber(tenantSlug: string, sequenceNum: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(5, '0');
  return `CF-${year}-${padded}`;
}

export function generateWorkOrderNumber(sequenceNum: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(5, '0');
  return `WO-${year}-${padded}`;
}

export function generateClaimNumber(sequenceNum: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(5, '0');
  return `CL-${year}-${padded}`;
}

// ─── API Response Types ─────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
