import { PrismaClient, UserRole, IssueStatus, Urgency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CityFix database...\n');

  // ─── 1. Tenants ──────────────────────────────────
  const telAviv = await prisma.tenant.upsert({
    where: { slug: 'tel-aviv' },
    update: {},
    create: {
      name: 'עיריית תל אביב-יפו',
      slug: 'tel-aviv',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      contactEmail: 'info@tel-aviv.gov.il',
      contactPhone: '106',
      website: 'https://www.tel-aviv.gov.il',
      population: 460613,
      slaConfig: {
        POTHOLE: { response: 4, resolution: 48 },
        STREETLIGHT: { response: 2, resolution: 24 },
        WASTE: { response: 1, resolution: 8 },
        SAFETY: { response: 1, resolution: 4 },
      },
    },
  });

  const haifa = await prisma.tenant.upsert({
    where: { slug: 'haifa' },
    update: {},
    create: {
      name: 'עיריית חיפה',
      slug: 'haifa',
      primaryColor: '#0891B2',
      secondaryColor: '#0E7490',
      contactEmail: 'info@haifa.muni.il',
      contactPhone: '106',
      population: 285316,
    },
  });

  console.log('✅ Tenants created:', telAviv.slug, haifa.slug);

  // ─── 2. Departments (Tel Aviv) ───────────────────
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: telAviv.id, name: 'מחלקת כבישים' } },
      update: {},
      create: { tenantId: telAviv.id, name: 'מחלקת כבישים', color: '#EF4444', icon: 'road' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: telAviv.id, name: 'מחלקת חשמל' } },
      update: {},
      create: { tenantId: telAviv.id, name: 'מחלקת חשמל', color: '#F59E0B', icon: 'zap' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: telAviv.id, name: 'מחלקת ניקיון' } },
      update: {},
      create: { tenantId: telAviv.id, name: 'מחלקת ניקיון', color: '#10B981', icon: 'sparkles' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: telAviv.id, name: 'מחלקת גנים' } },
      update: {},
      create: { tenantId: telAviv.id, name: 'מחלקת גנים', color: '#22C55E', icon: 'trees' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: telAviv.id, name: 'מחלקת תנועה' } },
      update: {},
      create: { tenantId: telAviv.id, name: 'מחלקת תנועה', color: '#F97316', icon: 'traffic-cone' },
    }),
  ]);

  console.log('✅ Departments created:', departments.length);

  // ─── 3. Categories (Tel Aviv) ────────────────────
  const categoryData = [
    { name: 'בור בכביש', nameEn: 'Pothole', nameAr: 'حفرة في الطريق', icon: 'road', color: '#EF4444', deptIdx: 0, sla: 48 },
    { name: 'פנס רחוב תקול', nameEn: 'Broken Streetlight', nameAr: 'إنارة شارع معطلة', icon: 'lightbulb', color: '#F59E0B', deptIdx: 1, sla: 24 },
    { name: 'פסולת / גזם', nameEn: 'Waste / Debris', nameAr: 'نفايات / أنقاض', icon: 'trash', color: '#10B981', deptIdx: 2, sla: 8 },
    { name: 'מפגע בטיחות', nameEn: 'Safety Hazard', nameAr: 'خطر أمان', icon: 'alert-triangle', color: '#DC2626', deptIdx: 0, sla: 4 },
    { name: 'מדרכה שבורה', nameEn: 'Broken Sidewalk', nameAr: 'رصيف مكسور', icon: 'footprints', color: '#8B5CF6', deptIdx: 0, sla: 72 },
    { name: 'ניקוז / הצפה', nameEn: 'Drainage / Flooding', nameAr: 'صرف / فيضان', icon: 'droplets', color: '#3B82F6', deptIdx: 0, sla: 12 },
    { name: 'תמרור / רמזור', nameEn: 'Sign / Traffic Light', nameAr: 'إشارة مرور', icon: 'traffic-cone', color: '#F97316', deptIdx: 4, sla: 24 },
    { name: 'מפגע בגינה ציבורית', nameEn: 'Park Hazard', nameAr: 'خطر في الحديقة العامة', icon: 'trees', color: '#22C55E', deptIdx: 3, sla: 72 },
    { name: 'חניה / רכב נטוש', nameEn: 'Parking / Abandoned Vehicle', nameAr: 'مركبة مهجورة', icon: 'car', color: '#6366F1', deptIdx: 4, sla: 48 },
    { name: 'ונדליזם', nameEn: 'Vandalism', nameAr: 'تخريب', icon: 'shield-alert', color: '#EC4899', deptIdx: 0, sla: 72 },
  ];

  const categories = await Promise.all(
    categoryData.map((cat, i) =>
      prisma.serviceCategory.upsert({
        where: { tenantId_name: { tenantId: telAviv.id, name: cat.name } },
        update: {},
        create: {
          tenantId: telAviv.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          icon: cat.icon,
          color: cat.color,
          departmentId: departments[cat.deptIdx].id,
          slaHours: cat.sla,
          sortOrder: i,
        },
      }),
    ),
  );

  console.log('✅ Categories created:', categories.length);

  // ─── 4. Users ────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: telAviv.id, email: 'admin@tel-aviv.gov.il' } },
    update: {},
    create: {
      tenantId: telAviv.id,
      email: 'admin@tel-aviv.gov.il',
      firstName: 'משה',
      lastName: 'כהן',
      role: UserRole.ADMIN,
      passwordHash,
      phone: '050-1234567',
    },
  });

  const deptManager = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: telAviv.id, email: 'roads@tel-aviv.gov.il' } },
    update: {},
    create: {
      tenantId: telAviv.id,
      email: 'roads@tel-aviv.gov.il',
      firstName: 'דוד',
      lastName: 'לוי',
      role: UserRole.DEPT_MANAGER,
      passwordHash,
      departmentId: departments[0].id,
    },
  });

  const citizen = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: telAviv.id, email: 'citizen@example.com' } },
    update: {},
    create: {
      tenantId: telAviv.id,
      email: 'citizen@example.com',
      firstName: 'יעל',
      lastName: 'ישראלי',
      role: UserRole.RESIDENT,
      passwordHash,
      phone: '054-9876543',
    },
  });

  console.log('✅ Users created: admin, dept_manager, citizen');

  // ─── 5. Demo Issues ─────────────────────────────
  const tlvCenter = { lat: 32.0853, lng: 34.7818 };
  const issueSeeds = [
    { cat: 0, desc: 'בור גדול ברחוב הרצל, מזה שבועיים', addr: 'רחוב הרצל 42', lat: 32.0649, lng: 34.7717, urgency: Urgency.HIGH, status: IssueStatus.NEW },
    { cat: 1, desc: 'פנס רחוב כבוי השבוע, חשוך מאוד בלילה', addr: 'שדרות רוטשילד 18', lat: 32.0636, lng: 34.7733, urgency: Urgency.NORMAL, status: IssueStatus.ASSIGNED },
    { cat: 2, desc: 'ערימת פסולת ליד הפח ברחוב דיזנגוף', addr: 'רחוב דיזנגוף 99', lat: 32.0778, lng: 34.7744, urgency: Urgency.NORMAL, status: IssueStatus.IN_PROGRESS },
    { cat: 4, desc: 'מדרכה שבורה ומסוכנת, סכנה לקשישים', addr: 'רחוב אלנבי 30', lat: 32.0694, lng: 34.7688, urgency: Urgency.HIGH, status: IssueStatus.NEW },
    { cat: 7, desc: 'שלט נפל בגינה הציבורית', addr: 'רחוב בן יהודה 5', lat: 32.0834, lng: 34.7694, urgency: Urgency.LOW, status: IssueStatus.RESOLVED },
    { cat: 3, desc: 'ברזל בולט מהקרקע ליד גן ילדים', addr: 'רחוב ארלוזורוב 80', lat: 32.0876, lng: 34.7836, urgency: Urgency.CRITICAL, status: IssueStatus.IN_PROGRESS },
    { cat: 6, desc: 'רמזור מהבהב, לא עובד כראוי', addr: 'צומת קפלן-איבן גבירול', lat: 32.0728, lng: 34.7858, urgency: Urgency.HIGH, status: IssueStatus.ASSIGNED },
    { cat: 5, desc: 'הצפה קלה לאחר גשם, בור ניקוז סתום', addr: 'רחוב חיים ברלב 12', lat: 32.0952, lng: 34.7901, urgency: Urgency.NORMAL, status: IssueStatus.NEW },
    { cat: 8, desc: 'רכב נטוש כבר חודש ואף אחד לא מפנה', addr: 'רחוב פינסקר 44', lat: 32.0682, lng: 34.7701, urgency: Urgency.LOW, status: IssueStatus.PENDING_VERIFICATION },
    { cat: 9, desc: 'גרפיטי על קיר בניין ציבורי', addr: 'רחוב לילינבלום 20', lat: 32.0612, lng: 34.7711, urgency: Urgency.LOW, status: IssueStatus.NEW },
    { cat: 0, desc: 'שקיעת כביש ליד צומת, מסוכן בנסיעה', addr: 'רחוב ז\'בוטינסקי 7', lat: 32.0898, lng: 34.7928, urgency: Urgency.CRITICAL, status: IssueStatus.ASSIGNED },
    { cat: 2, desc: 'גזם לאחר גיזום עצים, חוסם מדרכה', addr: 'שדרות שאול המלך 50', lat: 32.0806, lng: 34.7875, urgency: Urgency.NORMAL, status: IssueStatus.RESOLVED },
  ];

  // Clean up old seeded issues (by reporter = citizen) to allow re-seeding
  await prisma.issueReport.deleteMany({
    where: { tenantId: telAviv.id, reporterId: citizen.id },
  });

  const issues = await Promise.all(
    issueSeeds.map((seed, i) =>
      prisma.issueReport.create({
        data: {
          tenantId: telAviv.id,
          reportNumber: `CF-2026-${String(Date.now() % 100000 + i).padStart(5, '0')}`,
          categoryId: categories[seed.cat].id,
          description: seed.desc,
          address: seed.addr,
          latitude: seed.lat,
          longitude: seed.lng,
          urgency: seed.urgency,
          status: seed.status,
          reporterId: citizen.id,
          assignedDeptId: categories[seed.cat].departmentId,
          slaDeadline: new Date(Date.now() + (categoryData[seed.cat].sla * 3600000)),
          resolvedAt: seed.status === IssueStatus.RESOLVED ? new Date() : null,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
        },
      }),
    ),
  );

  console.log('✅ Issues created:', issues.length);

  // ─── 6. Sample Comments ──────────────────────────
  await prisma.issueComment.createMany({
    data: [
      { issueId: issues[0].id, authorId: admin.id, content: 'פנייה התקבלה, מעבירים לטיפול מחלקת כבישים', isSystemNote: true },
      { issueId: issues[2].id, authorId: deptManager.id, content: 'צוות ניקיון בדרך, צפוי להגיע תוך 2 שעות', isInternal: false },
      { issueId: issues[5].id, authorId: admin.id, content: '⚠️ מפגע קריטי - נשלח צוות חירום מיידי', isInternal: true },
      { issueId: issues[4].id, authorId: deptManager.id, content: 'השלט הוחלף. הפנייה טופלה.', isSystemNote: false },
    ],
  });

  console.log('✅ Comments created');

  // ─── 7. Status History ───────────────────────────
  const historyEntries = issues.flatMap((issue) => {
    const base = [{ issueId: issue.id, fromStatus: null, toStatus: IssueStatus.NEW, createdAt: issue.createdAt }];
    if (issue.status !== IssueStatus.NEW) {
      base.push({ issueId: issue.id, fromStatus: IssueStatus.NEW as any, toStatus: issue.status, createdAt: new Date() });
    }
    return base;
  });

  await prisma.issueStatusHistory.createMany({ data: historyEntries });

  console.log('✅ Status history created');
  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@tel-aviv.gov.il / Admin123!');
  console.log('  Manager:  roads@tel-aviv.gov.il / Admin123!');
  console.log('  Citizen:  citizen@example.com   / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
