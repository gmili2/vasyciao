/**
 * Catalogue de départ (vêtements, catégories, marque, livraison), partagé par :
 * - prisma/seed.ts (données de démonstration complètes, base vidée au préalable) ;
 * - src/cli/bootstrap.ts (premier démarrage en production, sans rien écraser).
 */
import { Gender, MovementType, PrismaClient, ProductStatus } from '@prisma/client';
import products from './catalog-products.json';
import adminData from './catalog-admin.json';

/** Montant en dirhams → centimes. Les prix du catalogue (catalog-products.json) sont en DH. */
const dh = (n: number) => Math.round(n * 100);
const slugify = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

/* Données de gestion (stock, ventes, matière…) complétant le catalogue du site, par slug (catalog-admin.json). */
export const ADMIN: Record<string, {
  sku: string; category: string; stock: number; sold: number; status?: ProductStatus; color: string; caseMat: string; strap: string; glass: string;
}> = adminData.admin;

/* Options (couleur, taille, pointure) et déclinaisons de départ : 5 pièces par déclinaison. */
export const VARIANTS: Record<string, {
  options: { name: string; values: (string | null)[][] }[];
  variants: { values: string[]; suffix: string; stock: number; priceCents?: number }[];
}> = adminData.variants;

/* Rayons de la boutique (photos ajoutables depuis Admin → Catégories). */
export const CATEGORIES: [slug: string, name: string, description: string, imageUrl: string | null][] = [
  ['vestes', 'Vestes', 'Tailleurs, vestes chemises et vestes militaires.', null],
  ['hauts', 'Hauts', 'T-shirts, chemises, blouses, pulls et hoodies.', null],
  ['pantalons', 'Pantalons', 'Pantalons larges à pinces et pantalons tailleur.', null],
  ['robes', 'Robes', 'Robes longues et fluides.', null],
  ['accessoires', 'Accessoires', 'Sacs et accessoires Vasyciao.', null],
];


export type CatalogProduct = { id: string; name: string; sku: string; unit: number; variants: Record<string, { id: string; sku: string; unit: number }> };

/** Marque maison, catégories et livraison : créées seulement si elles n'existent pas. */
export async function installReferenceData(prisma: PrismaClient) {
  const brands: Record<string, string> = {};
  const house = await prisma.brand.findUnique({ where: { slug: 'vasyciao' } })
    ?? await prisma.brand.create({ data: { name: 'VASYCIAO', slug: 'vasyciao', description: 'Vêtements femme et homme au Maroc.' } });
  brands.VASYCIAO = house.id;

  const cats: Record<string, string> = {};
  for (const [i, [slug, name, description, imageUrl]] of CATEGORIES.entries()) {
    const c = await prisma.category.findUnique({ where: { slug } })
      ?? await prisma.category.create({ data: { slug, name, description, imageUrl, position: i } });
    cats[slug] = c.id;
  }

  let shipping = await prisma.shippingMethod.findFirst({ where: { isActive: true }, orderBy: { position: 'asc' } });
  if (!shipping) {
    const zone = await prisma.shippingZone.create({ data: { name: 'Maroc', countries: ['MA'] } });
    shipping = await prisma.shippingMethod.create({
      data: { zoneId: zone.id, name: 'Livraison incluse', carrier: 'Amana', priceCents: 0, minDays: 2, maxDays: 4, codAllowed: true, position: 0 },
    });
  }
  return { brands, cats, shipping };
}

/** Articles du catalogue de départ (options et déclinaisons). Les articles déjà présents (même slug) sont ignorés. */
export async function installCatalog(prisma: PrismaClient, actorId: string, refs: Awaited<ReturnType<typeof installReferenceData>>) {
  const { brands, cats } = refs;
  for (const name of new Set(products.map((p) => p.brand))) {
    if (brands[name]) continue;
    const slug = slugify(name);
    brands[name] = (await prisma.brand.findUnique({ where: { slug } }) ?? await prisma.brand.create({ data: { name, slug } })).id;
  }

  const prod: Record<string, CatalogProduct> = {};
  for (const p of products) {
    if (await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true } })) continue;
    const a = ADMIN[p.slug];
    // Photo de départ facultative (public/ du site), à ajouter ensuite depuis l'admin.
    const image = (p as { image?: string | null }).image ?? null;
    if (!a) throw new Error(`Données de gestion manquantes pour ${p.slug}`);
    const brandId = brands[p.brand];
    const priceCents = dh(p.old ?? p.price);
    const salePriceCents = p.old ? dh(p.price) : null;
    const isNew = p.cats.includes('new');
    const collection = await prisma.collection.findUnique({ where: { slug: p.slug } })
      ?? await prisma.collection.create({ data: { name: p.collection, slug: p.slug, brandId } });
    const created = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, shortDescription: p.kind, description: p.desc, reference: a.sku, sku: a.sku,
        priceCents, salePriceCents, stock: a.stock, status: a.status ?? 'ACTIVE', isFeatured: isNew, gender: (p as { gender?: Gender }).gender ?? Gender.UNISEX,
        brandId, categoryId: cats[a.category],
        collectionId: collection.id,
        // Champs hérités du modèle « montre » : matière (caseMaterial), coupe (strapMaterial), entretien (glass).
        movementType: MovementType.QUARTZ, caseMaterial: a.caseMat, strapMaterial: a.strap, color: a.color,
        diameterMm: 0, waterResistanceM: 0, glass: a.glass,
        extraSpecs: { tags: p.cats, kind: p.kind, movement: p.movement, dims: p.dims, strap: p.strap, glass: p.glass, water: p.water },
        soldCount: a.sold, ratingAvg: p.rating, ratingCount: p.reviews,
        publishedAt: (a.status ?? 'ACTIVE') === 'ACTIVE' ? new Date(isNew ? '2026-09-15T09:00:00Z' : '2025-11-01T09:00:00Z') : null,
        stockMovements: { create: { delta: a.stock, reason: 'INITIAL', actorId } },
        // Photo servie par le front (public/) tant que Cloudinary/S3 n'est pas configuré.
        images: image ? { create: { provider: 'LOCAL', storageKey: image.replace(/^\//, ''), url: image, alt: p.name, position: 0, isPrimary: true } } : undefined,
      },
    });
    prod[p.slug] = { id: created.id, name: p.name, sku: a.sku, unit: p.price * 100, variants: {} };

    const conf = VARIANTS[p.slug];
    if (conf) {
      const valueIds = new Map<string, string>();
      for (const [i, o] of conf.options.entries()) {
        const option = await prisma.productOption.create({
          data: { productId: created.id, name: o.name, position: i, values: { create: o.values.map(([label, colorHex], j) => ({ label: label!, colorHex, position: j })) } },
          include: { values: true },
        });
        option.values.forEach((v) => valueIds.set(v.label, v.id));
      }
      // Le stock initial du produit est remplacé par celui des déclinaisons (même total).
      await prisma.stockMovement.deleteMany({ where: { productId: created.id } });
      for (const [i, v] of conf.variants.entries()) {
        const sku = `${a.sku}-${v.suffix}`;
        const variant = await prisma.productVariant.create({
          data: {
            productId: created.id, sku, stock: v.stock, priceCents: v.priceCents ?? null, position: i,
            values: { create: v.values.map((label) => ({ optionValueId: valueIds.get(label)! })) },
            stockMovements: v.stock ? { create: { productId: created.id, delta: v.stock, reason: 'INITIAL', actorId } } : undefined,
          },
        });
        prod[p.slug].variants[v.values.join(' · ')] = { id: variant.id, sku, unit: v.priceCents ?? p.price * 100 };
      }
      const total = conf.variants.reduce((n, v) => n + v.stock, 0);
      if (total !== a.stock) throw new Error(`Stock des déclinaisons de ${p.slug} (${total}) ≠ ${a.stock}`);
    }
  }
  return prod;
}
