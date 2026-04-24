import { PrismaClient, UserRole, IssueStatus, Urgency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedDatabase(prismaClient?: PrismaClient) {
  const prisma = prismaClient || new PrismaClient();
  console.log('🌱 Seeding CityFix database...\n');

  // ─── 1. Tenants ──────────────────────────────────
  // The PUBLIC tenant is the singleton container for orphan citizen reports
  // — every report whose location does NOT match a claimed municipality
  // lands here and waits for adoption.
  const publicTenant = await prisma.tenant.upsert({
    where: { slug: 'public' },
    update: { kind: 'PUBLIC', isClaimed: false },
    create: {
      name: 'CityFix — שכבה ציבורית',
      slug: 'public',
      kind: 'PUBLIC',
      isClaimed: false,
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      contactEmail: 'support@cityfix.itninja.co.il',
      website: 'https://cityfix.itninja.co.il',
      population: 9000000,
    },
  });

  // Legacy "global" tenant — kept for backward compat; redirects/UI may map it
  // to PUBLIC. New code should use `publicTenant` (slug=public).
  const global = await prisma.tenant.upsert({
    where: { slug: 'global' },
    update: { kind: 'PUBLIC' },
    create: {
      name: 'CityFix — דיווח ארצי (legacy)',
      slug: 'global',
      kind: 'PUBLIC',
      isClaimed: false,
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      contactEmail: 'support@cityfix.itninja.co.il',
      population: 9000000,
    },
  });

  const telAviv = await prisma.tenant.upsert({
    where: { slug: 'tel-aviv' },
    update: {
      kind: 'MUNICIPALITY',
      isClaimed: true,
      centerLat: 32.0853,
      centerLng: 34.7818,
      radiusKm: 8,
    },
    create: {
      name: 'עיריית תל אביב-יפו',
      slug: 'tel-aviv',
      kind: 'MUNICIPALITY',
      isClaimed: true,
      claimedAt: new Date(),
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      contactEmail: 'info@tel-aviv.gov.il',
      contactPhone: '106',
      website: 'https://www.tel-aviv.gov.il',
      population: 460613,
      centerLat: 32.0853,
      centerLng: 34.7818,
      radiusKm: 8,
      slaConfig: {
        POTHOLE: { response: 4, resolution: 48 },
        STREETLIGHT: { response: 2, resolution: 24 },
        WASTE: { response: 1, resolution: 8 },
        SAFETY: { response: 1, resolution: 4 },
      },
    },
  });

  const demoCity = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'עיריית דמו',
      slug: 'demo',
      primaryColor: '#14B8A6',
      secondaryColor: '#0D9488',
      contactEmail: 'info@demo.gov.il',
      contactPhone: '106',
      website: 'https://www.demo.gov.il',
      population: 100000,
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

  const kafrQasim = await prisma.tenant.upsert({
    where: { slug: 'kafr-qasim' },
    update: {},
    create: {
      name: 'עיריית כפר קאסם',
      slug: 'kafr-qasim',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      contactEmail: 'info@kfar-qasem.muni.il',
      contactPhone: '106',
      population: 24000,
    },
  });

  const roshHaayin = await prisma.tenant.upsert({
    where: { slug: 'rosh-haayin' },
    update: {},
    create: {
      name: 'עיריית ראש העין',
      slug: 'rosh-haayin',
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      contactEmail: 'info@rosh-haayin.muni.il',
      contactPhone: '106',
      population: 74000,
    },
  });

  const jerusalem = await prisma.tenant.upsert({
    where: { slug: 'jerusalem' },
    update: {},
    create: {
      name: 'עיריית ירושלים',
      slug: 'jerusalem',
      primaryColor: '#FBBF24',
      secondaryColor: '#B45309',
      contactEmail: '106@jerusalem.muni.il',
      contactPhone: '106',
      website: 'https://www.jerusalem.muni.il',
      population: 936425,
    },
  });

  const rishonLezion = await prisma.tenant.upsert({
    where: { slug: 'rishon-lezion' },
    update: {},
    create: {
      name: 'עיריית ראשון לציון',
      slug: 'rishon-lezion',
      primaryColor: '#F97316',
      secondaryColor: '#C2410C',
      contactEmail: 'info@rishonlezion.muni.il',
      contactPhone: '106',
      population: 257128,
    },
  });

  const petahTikva = await prisma.tenant.upsert({
    where: { slug: 'petah-tikva' },
    update: {},
    create: {
      name: 'עיריית פתח תקווה',
      slug: 'petah-tikva',
      primaryColor: '#3B82F6',
      secondaryColor: '#1D4ED8',
      contactEmail: '106@ptikva.org.il',
      contactPhone: '106',
      population: 252400,
    },
  });

  const ashdod = await prisma.tenant.upsert({
    where: { slug: 'ashdod' },
    update: {},
    create: {
      name: 'עיריית אשדוד',
      slug: 'ashdod',
      primaryColor: '#0EA5E9',
      secondaryColor: '#0369A1',
      contactEmail: '106@ashdod.muni.il',
      contactPhone: '106',
      population: 225939,
    },
  });

  const netanya = await prisma.tenant.upsert({
    where: { slug: 'netanya' },
    update: {},
    create: {
      name: 'עיריית נתניה',
      slug: 'netanya',
      primaryColor: '#EAB308',
      secondaryColor: '#A16207',
      contactEmail: '106@netanya.muni.il',
      contactPhone: '106',
      population: 224066,
    },
  });

  const beersheba = await prisma.tenant.upsert({
    where: { slug: 'beersheba' },
    update: {},
    create: {
      name: 'עיריית באר שבע',
      slug: 'beersheba',
      primaryColor: '#D946EF',
      secondaryColor: '#A21CAF',
      contactEmail: '106@br7.org.il',
      contactPhone: '106',
      population: 211251,
    },
  });

  const holon = await prisma.tenant.upsert({
    where: { slug: 'holon' },
    update: {},
    create: {
      name: 'עיריית חולון',
      slug: 'holon',
      primaryColor: '#8B5CF6',
      secondaryColor: '#6D28D9',
      contactEmail: '106@holon.muni.il',
      contactPhone: '106',
      population: 196282,
    },
  });

  const bneiBrak = await prisma.tenant.upsert({
    where: { slug: 'bnei-brak' },
    update: {},
    create: {
      name: 'עיריית בני ברק',
      slug: 'bnei-brak',
      primaryColor: '#64748B',
      secondaryColor: '#334155',
      contactEmail: '106@bbm.org.il',
      contactPhone: '106',
      population: 212395,
    },
  });

  const ramatGan = await prisma.tenant.upsert({
    where: { slug: 'ramat-gan' },
    update: {},
    create: {
      name: 'עיריית רמת גן',
      slug: 'ramat-gan',
      primaryColor: '#14B8A6',
      secondaryColor: '#0D9488',
      contactEmail: '106@ramat-gan.muni.il',
      contactPhone: '109',
      population: 172943,
    },
  });

  const ashkelon = await prisma.tenant.upsert({
    where: { slug: 'ashkelon' },
    update: {},
    create: {
      name: 'עיריית אשקלון',
      slug: 'ashkelon',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      contactEmail: '106@ashkelon.muni.il',
      contactPhone: '106',
      population: 153138,
    },
  });

  const rehovot = await prisma.tenant.upsert({
    where: { slug: 'rehovot' },
    update: {},
    create: {
      name: 'עיריית רחובות',
      slug: 'rehovot',
      primaryColor: '#84CC16',
      secondaryColor: '#65A30D',
      contactEmail: '106@rehovot.muni.il',
      contactPhone: '106',
      population: 149303,
    },
  });

  const batYam = await prisma.tenant.upsert({
    where: { slug: 'bat-yam' },
    update: {},
    create: {
      name: 'עיריית בת ים',
      slug: 'bat-yam',
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      contactEmail: '106@bat-yam.muni.il',
      contactPhone: '106',
      population: 128224,
    },
  });

  const beitShemesh = await prisma.tenant.upsert({
    where: { slug: 'beit-shemesh' },
    update: {},
    create: {
      name: 'עיריית בית שמש',
      slug: 'beit-shemesh',
      primaryColor: '#F43F5E',
      secondaryColor: '#E11D48',
      contactEmail: '106@bshemesh.co.il',
      contactPhone: '106',
      population: 152865,
    },
  });

  console.log('✅ Tenants created:', telAviv.slug, demoCity.slug, haifa.slug, kafrQasim.slug, roshHaayin.slug, jerusalem.slug, rishonLezion.slug, petahTikva.slug, ashdod.slug, netanya.slug, beersheba.slug, holon.slug, bneiBrak.slug, ramatGan.slug, ashkelon.slug, rehovot.slug, batYam.slug, beitShemesh.slug);

  // ─── 1b. Geographic envelopes for the geo-resolver / adoption ────
  // Quick centroid + radius bounding circles. Polygons can be added later.
  const geoEnvelopes: Array<{ slug: string; lat: number; lng: number; radiusKm: number }> = [
    { slug: 'haifa',         lat: 32.7940, lng: 34.9896, radiusKm: 10 },
    { slug: 'kafr-qasim',    lat: 32.1149, lng: 34.9760, radiusKm: 4 },
    { slug: 'rosh-haayin',   lat: 32.0833, lng: 34.9500, radiusKm: 5 },
    { slug: 'jerusalem',     lat: 31.7683, lng: 35.2137, radiusKm: 15 },
    { slug: 'rishon-lezion', lat: 31.9710, lng: 34.7892, radiusKm: 9 },
    { slug: 'petah-tikva',   lat: 32.0840, lng: 34.8878, radiusKm: 8 },
    { slug: 'ashdod',        lat: 31.8044, lng: 34.6553, radiusKm: 8 },
    { slug: 'netanya',       lat: 32.3329, lng: 34.8599, radiusKm: 9 },
    { slug: 'beersheba',     lat: 31.2530, lng: 34.7915, radiusKm: 10 },
    { slug: 'holon',         lat: 32.0167, lng: 34.7792, radiusKm: 6 },
    { slug: 'bnei-brak',     lat: 32.0807, lng: 34.8338, radiusKm: 4 },
    { slug: 'ramat-gan',     lat: 32.0680, lng: 34.8242, radiusKm: 5 },
    { slug: 'ashkelon',      lat: 31.6688, lng: 34.5742, radiusKm: 8 },
    { slug: 'rehovot',       lat: 31.8967, lng: 34.8113, radiusKm: 6 },
    { slug: 'bat-yam',       lat: 32.0167, lng: 34.7500, radiusKm: 4 },
    { slug: 'beit-shemesh',  lat: 31.7500, lng: 34.9863, radiusKm: 6 },
    { slug: 'demo',          lat: 32.0500, lng: 34.8000, radiusKm: 5 },
  ];

  await Promise.all(
    geoEnvelopes.map((g) =>
      prisma.tenant.update({
        where: { slug: g.slug },
        data: {
          kind: 'MUNICIPALITY',
          // These cities are pre-seeded as *unclaimed* — they will flip to
          // `isClaimed=true` only when an admin adopts orphans for them.
          centerLat: g.lat,
          centerLng: g.lng,
          radiusKm: g.radiusKm,
        },
      }).catch(() => null), // ignore if the slug doesn't exist
    ),
  );
  console.log('✅ Geographic envelopes set for', geoEnvelopes.length, 'municipalities');

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
    where: { email: 'admin@tel-aviv.gov.il' },
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
    where: { email: 'roads@tel-aviv.gov.il' },
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
    where: { email: 'citizen@example.com' },
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
    const base: any[] = [{ issueId: issue.id, fromStatus: null, toStatus: IssueStatus.NEW, createdAt: issue.createdAt }];
    if (issue.status !== IssueStatus.NEW) {
      base.push({ issueId: issue.id, fromStatus: IssueStatus.NEW as any, toStatus: issue.status, createdAt: new Date() });
    }
    return base;
  });

  await prisma.issueStatusHistory.createMany({ data: historyEntries });

  console.log('✅ Status history created');

  // ─── 8. Demo City Seeding ──────────────────────────
  console.log('\n🌱 Seeding Demo City...');
  const demoDepartments = await Promise.all([
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: demoCity.id, name: 'מחלקת כבישים' } },
      update: {},
      create: { tenantId: demoCity.id, name: 'מחלקת כבישים', color: '#EF4444', icon: 'road' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: demoCity.id, name: 'מחלקת חשמל' } },
      update: {},
      create: { tenantId: demoCity.id, name: 'מחלקת חשמל', color: '#F59E0B', icon: 'zap' },
    }),
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: demoCity.id, name: 'מחלקת ניקיון' } },
      update: {},
      create: { tenantId: demoCity.id, name: 'מחלקת ניקיון', color: '#10B981', icon: 'sparkles' },
    }),
  ]);

  const demoCategories = await Promise.all(
    categoryData.slice(0, 3).map((cat, i) =>
      prisma.serviceCategory.upsert({
        where: { tenantId_name: { tenantId: demoCity.id, name: cat.name } },
        update: {},
        create: {
          tenantId: demoCity.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          icon: cat.icon,
          color: cat.color,
          departmentId: demoDepartments[i].id,
          slaHours: cat.sla,
          sortOrder: i,
        },
      }),
    ),
  );

  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.gov.il' },
    update: {},
    create: {
      tenantId: demoCity.id,
      email: 'admin@demo.gov.il',
      firstName: 'מנהל',
      lastName: 'דמו',
      role: UserRole.ADMIN,
      passwordHash,
      phone: '050-0000000',
    },
  });

  const demoCitizen = await prisma.user.upsert({
    where: { email: 'citizen@demo.com' },
    update: {},
    create: {
      tenantId: demoCity.id,
      email: 'citizen@demo.com',
      firstName: 'אזרח',
      lastName: 'דמו',
      role: UserRole.RESIDENT,
      passwordHash,
      phone: '054-0000000',
    },
  });

  await prisma.issueReport.deleteMany({
    where: { tenantId: demoCity.id, reporterId: demoCitizen.id },
  });

  const demoIssues = await Promise.all(
    issueSeeds.slice(0, 3).map((seed, i) =>
      prisma.issueReport.create({
        data: {
          tenantId: demoCity.id,
          reportNumber: `DEMO-2026-${String(Date.now() % 100000 + i).padStart(5, '0')}`,
          categoryId: demoCategories[i].id,
          description: seed.desc,
          address: seed.addr,
          latitude: seed.lat,
          longitude: seed.lng,
          urgency: seed.urgency,
          status: seed.status,
          reporterId: demoCitizen.id,
          assignedDeptId: demoCategories[i].departmentId,
          slaDeadline: new Date(Date.now() + (categoryData[i].sla * 3600000)),
          resolvedAt: seed.status === IssueStatus.RESOLVED ? new Date() : null,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
        },
      }),
    ),
  );

  await prisma.issueComment.createMany({
    data: [
      { issueId: demoIssues[0].id, authorId: demoAdmin.id, content: 'פניית דמו התקבלה', isSystemNote: true },
    ],
  });

  // ─── 7. Global Tenant Data ────────────────────────
  const globalDepartments = await Promise.all([
    prisma.department.upsert({
      where: { tenantId_name: { tenantId: global.id, name: 'מוקד CityFix ארצי' } },
      update: {},
      create: { tenantId: global.id, name: 'מוקד CityFix ארצי', color: '#6366F1', icon: 'globe' },
    }),
  ]);

  await Promise.all(
    categoryData.map((cat, i) =>
      prisma.serviceCategory.upsert({
        where: { tenantId_name: { tenantId: global.id, name: cat.name } },
        update: {},
        create: {
          tenantId: global.id,
          name: cat.name,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          icon: cat.icon,
          color: cat.color,
          departmentId: globalDepartments[0].id,
          slaHours: cat.sla,
          sortOrder: i,
        },
      }),
    ),
  );

  const globalAdmin = await prisma.user.upsert({
    where: { email: 'admin@cityfix.itninja.co.il' },
    update: {},
    create: {
      tenantId: global.id,
      email: 'admin@cityfix.itninja.co.il',
      firstName: 'מנהל',
      lastName: 'מערכת',
      role: UserRole.SUPER_ADMIN,
      passwordHash,
      phone: '050-1111111',
    },
  });

  // ─── 9. Orphan reports in PUBLIC tenant ──────────
  // Demonstrates the adoption flow: citizen reports in cities that haven't
  // joined yet (Haifa & Be'er Sheva) accumulate in the PUBLIC tenant and
  // wait for those municipalities to claim them.
  await prisma.serviceCategory.upsert({
    where: { tenantId_name: { tenantId: publicTenant.id, name: 'בור בכביש' } },
    update: {},
    create: {
      tenantId: publicTenant.id,
      name: 'בור בכביש',
      nameEn: 'Pothole',
      nameAr: 'حفرة في الطريق',
      icon: 'road',
      color: '#EF4444',
      sortOrder: 0,
    },
  });
  const publicCategories = await prisma.serviceCategory.findMany({
    where: { tenantId: publicTenant.id },
    select: { id: true, name: true },
  });
  const publicPotholeCat = publicCategories.find((c) => c.name === 'בור בכביש');

  if (publicPotholeCat) {
    const orphanSeeds = [
      { desc: 'בור גדול ברחוב הרצל בחיפה', addr: 'רחוב הרצל 5, חיפה', lat: 32.7950, lng: 34.9890, urgency: Urgency.HIGH },
      { desc: 'מדרכה שבורה ליד בית הספר בבאר שבע', addr: 'רחוב רינגלבלום 10, באר שבע', lat: 31.2530, lng: 34.7910, urgency: Urgency.NORMAL },
      { desc: 'עמוד תאורה כבוי כבר שבוע', addr: 'רחוב רוטשילד, חיפה', lat: 32.7900, lng: 34.9850, urgency: Urgency.NORMAL },
      { desc: 'ערימת אשפה לא פונתה', addr: 'שכונה ב, באר שבע', lat: 31.2570, lng: 34.7950, urgency: Urgency.LOW },
    ];

    await prisma.issueReport.deleteMany({
      where: { tenantId: publicTenant.id, isOrphaned: true },
    });

    for (const [i, s] of orphanSeeds.entries()) {
      await prisma.issueReport.create({
        data: {
          tenantId: publicTenant.id,
          originalTenantId: publicTenant.id,
          reportNumber: `PUB-2026-${String(Date.now() % 100000 + i).padStart(5, '0')}`,
          categoryId: publicPotholeCat.id,
          description: s.desc,
          address: s.addr,
          latitude: s.lat,
          longitude: s.lng,
          urgency: s.urgency,
          status: IssueStatus.NEW,
          isOrphaned: true,
          isAnonymous: true,
          visibility: 'PUBLIC',
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 3600000),
        },
      });
    }
    console.log('✅ Orphan reports created:', orphanSeeds.length);
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('Global Admin: admin@cityfix.itninja.co.il / Admin123!');
  console.log('Demo accounts (Tel Aviv):');
  console.log('  Admin:    admin@tel-aviv.gov.il / Admin123!');
  console.log('  Manager:  roads@tel-aviv.gov.il / Admin123!');
  console.log('  Citizen:  citizen@example.com   / Admin123!');
  console.log('\nDemo accounts (Demo City):');
  console.log('  Admin:    admin@demo.gov.il     / Admin123!');
  console.log('  Citizen:  citizen@demo.com      / Admin123!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('❌ Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
