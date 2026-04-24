import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ResolvedTenant {
  tenantId: string;
  slug: string;
  name: string;
  isClaimed: boolean;
  matchType: 'polygon' | 'radius' | 'public-fallback';
}

/**
 * Resolves which municipality (Tenant) is responsible for a given coordinate.
 *
 * Resolution order:
 *   1. Polygon containment via GeoZone with `type='municipality_boundary'`
 *      and the tenant's own `boundary` field (GeoJSON Polygon/MultiPolygon)
 *   2. Bounding circle (centerLat/Lng + radiusKm) for tenants that haven't
 *      drawn a polygon yet
 *   3. PUBLIC tenant fallback — orphan report, waiting for adoption
 *
 * NOTE: This MVP implementation does the polygon test in JS (Ray-casting).
 * Production should switch to PostGIS `ST_Contains` for performance and
 * accuracy on multi-polygon edges.
 */
@Injectable()
export class GeoResolverService {
  private readonly logger = new Logger(GeoResolverService.name);

  constructor(private prisma: PrismaService) {}

  async resolve(latitude: number, longitude: number): Promise<ResolvedTenant> {
    const candidates = await this.prisma.tenant.findMany({
      where: {
        kind: 'MUNICIPALITY',
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        isClaimed: true,
        boundary: true,
        centerLat: true,
        centerLng: true,
        radiusKm: true,
      },
    });

    for (const t of candidates) {
      if (t.boundary && this.pointInGeoJson(latitude, longitude, t.boundary as any)) {
        return {
          tenantId: t.id,
          slug: t.slug,
          name: t.name,
          isClaimed: t.isClaimed,
          matchType: 'polygon',
        };
      }
    }

    for (const t of candidates) {
      if (
        t.centerLat != null &&
        t.centerLng != null &&
        t.radiusKm != null &&
        this.distanceKm(latitude, longitude, t.centerLat, t.centerLng) <= t.radiusKm
      ) {
        return {
          tenantId: t.id,
          slug: t.slug,
          name: t.name,
          isClaimed: t.isClaimed,
          matchType: 'radius',
        };
      }
    }

    const publicTenant = await this.getOrCreatePublicTenant();
    return {
      tenantId: publicTenant.id,
      slug: publicTenant.slug,
      name: publicTenant.name,
      isClaimed: false,
      matchType: 'public-fallback',
    };
  }

  /**
   * Returns the singleton "PUBLIC" tenant that owns all orphan reports.
   * Created lazily so the platform works even before any seed runs.
   */
  async getOrCreatePublicTenant() {
    const existing = await this.prisma.tenant.findFirst({
      where: { kind: 'PUBLIC' },
      select: { id: true, slug: true, name: true },
    });
    if (existing) return existing;

    return this.prisma.tenant.create({
      data: {
        name: 'CityFix — שכבה ציבורית',
        slug: 'public',
        kind: 'PUBLIC',
        isClaimed: false,
        primaryColor: '#6366F1',
        secondaryColor: '#4F46E5',
        contactEmail: 'support@cityfix.itninja.co.il',
      },
      select: { id: true, slug: true, name: true },
    });
  }

  /**
   * Find every orphan-PUBLIC report whose coordinates fall inside the
   * given tenant's polygon (or radius fallback). Used by AdoptionService.
   */
  async findOrphansInTenant(tenantId: string): Promise<string[]> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { boundary: true, centerLat: true, centerLng: true, radiusKm: true },
    });
    if (!tenant) return [];

    const publicTenant = await this.getOrCreatePublicTenant();

    const orphans = await this.prisma.issueReport.findMany({
      where: { tenantId: publicTenant.id, isOrphaned: true },
      select: { id: true, latitude: true, longitude: true },
    });

    return orphans
      .filter((o) => {
        if (tenant.boundary && this.pointInGeoJson(o.latitude, o.longitude, tenant.boundary as any)) {
          return true;
        }
        if (
          tenant.centerLat != null &&
          tenant.centerLng != null &&
          tenant.radiusKm != null &&
          this.distanceKm(o.latitude, o.longitude, tenant.centerLat, tenant.centerLng) <= tenant.radiusKm
        ) {
          return true;
        }
        return false;
      })
      .map((o) => o.id);
  }

  // ─── Geometry helpers ───────────────────────────────────────

  private distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  private pointInGeoJson(lat: number, lng: number, geo: any): boolean {
    if (!geo || typeof geo !== 'object') return false;

    if (geo.type === 'Polygon') {
      return this.pointInPolygon(lat, lng, geo.coordinates);
    }
    if (geo.type === 'MultiPolygon') {
      return (geo.coordinates as any[]).some((rings) => this.pointInPolygon(lat, lng, rings));
    }
    if (geo.type === 'Feature' && geo.geometry) {
      return this.pointInGeoJson(lat, lng, geo.geometry);
    }
    if (geo.type === 'FeatureCollection' && Array.isArray(geo.features)) {
      return geo.features.some((f: any) => this.pointInGeoJson(lat, lng, f));
    }
    return false;
  }

  /**
   * Ray-casting point-in-polygon. `coordinates` follows GeoJSON convention:
   * [outerRing, hole1, hole2, ...] where each ring is [[lng, lat], ...].
   */
  private pointInPolygon(lat: number, lng: number, coordinates: number[][][]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
    const outer = coordinates[0];

    let inside = false;
    for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) {
      const [xi, yi] = outer[i];
      const [xj, yj] = outer[j];
      const intersect =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
      if (intersect) inside = !inside;
    }

    if (!inside) return false;

    for (let r = 1; r < coordinates.length; r++) {
      const hole = coordinates[r];
      let inHole = false;
      for (let i = 0, j = hole.length - 1; i < hole.length; j = i++) {
        const [xi, yi] = hole[i];
        const [xj, yj] = hole[j];
        const intersect =
          yi > lat !== yj > lat &&
          lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
        if (intersect) inHole = !inHole;
      }
      if (inHole) return false;
    }

    return true;
  }
}
