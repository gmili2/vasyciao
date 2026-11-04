/**
 * Données initiales de développement : catalogue du site, compte admin,
 * clients, commandes, coupons, promotions et avis de la maquette admin.
 * Le script vide la base avant de la remplir : ne jamais le lancer en production.
 */
import { randomBytes } from 'node:crypto';
import {
  DiscountType, OrderStatus, PaymentMethod, PaymentStatus, Prisma, PrismaClient,
} from '@prisma/client';
import products from '../src/cli/catalog-products.json';
import { installCatalog, installReferenceData } from '../src/cli/catalog';
import { hashPassword } from '../src/common/password';

const prisma = new PrismaClient();
/** Montant en dirhams → centimes. Les prix du catalogue (seed-products.json) sont en DH. */
const dh = (n: number) => Math.round(n * 100);
/** « 07/10/2026 11:42 » (heure de Casablanca) → Date */
const frDate = (s: string) => {
  const [d, m, y, hh = '12', mm = '00'] = s.split(/[\/ :]/);
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:00+01:00`);
};
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000);

const CUSTOMERS: [name: string, email: string, since: string][] = [
  ['Camille Martin', 'camille.martin@mail.fr', '12/02/2026'], ['Hugo Bernard', 'hugo.b@mail.fr', '30/09/2026'],
  ['Léa Dubois', 'lea.dubois@mail.fr', '14/05/2026'], ['Nadia Haddad', 'nadia.h@mail.fr', '03/11/2025'],
  ['Thomas Petit', 't.petit@mail.fr', '01/10/2026'], ['Inès Moreau', 'ines.moreau@mail.fr', '22/07/2026'],
  ['Karim Benali', 'k.benali@mail.fr', '03/10/2026'], ['Julie Laurent', 'julie.l@mail.fr', '02/10/2026'],
  ['Antoine Leroy', 'a.leroy@mail.fr', '15/03/2026'],
];

type Pay = 'Payé' | 'À encaisser' | 'Échoué' | 'Remboursé';
const ORDERS: [number: string, email: string, date: string, items: [slug: string, qty: number, variant?: string][], status: OrderStatus, method: PaymentMethod, pay: Pay][] = [
  ['PS-284117', 'camille.martin@mail.fr', '07/10/2026 11:42', [['legging-compression', 1, 'Noir · M']], 'PENDING', 'CASH_ON_DELIVERY', 'À encaisser'],
  ['PS-284116', 'hugo.b@mail.fr', '07/10/2026 09:15', [['short-running-2-en-1', 1, 'Noir · L'], ['gourde-isotherme-750', 1, 'Volt']], 'CONFIRMED', 'CASH_ON_DELIVERY', 'À encaisser'],
  ['PS-284115', 'lea.dubois@mail.fr', '06/10/2026 18:03', [['brassiere-maintien-fort', 1, 'Volt · S']], 'PROCESSING', 'CASH_ON_DELIVERY', 'À encaisser'],
  ['PS-284114', 'nadia.h@mail.fr', '06/10/2026 14:27', [['top-yoga-seamless', 1, 'Craie · M']], 'SHIPPED', 'BANK_TRANSFER', 'Payé'],
  ['PS-284113', 't.petit@mail.fr', '05/10/2026 10:50', [['t-shirt-training-dry', 2, 'Noir · XL']], 'DELIVERED', 'CASH_ON_DELIVERY', 'Payé'],
  ['PS-284112', 'ines.moreau@mail.fr', '04/10/2026 16:11', [['chaussettes-running-lot-3', 2, 'Blanc · 39-42']], 'DELIVERED', 'CASH_ON_DELIVERY', 'Payé'],
  ['PS-284111', 'k.benali@mail.fr', '03/10/2026 12:38', [['maillot-football-pro', 1, 'Blanc · L']], 'CANCELLED', 'CASH_ON_DELIVERY', 'Échoué'],
  ['PS-284110', 'julie.l@mail.fr', '02/10/2026 20:04', [['pantalon-yoga-flow', 1, 'Noir · S']], 'REFUNDED', 'BANK_TRANSFER', 'Remboursé'],
  ['PS-284109', 'a.leroy@mail.fr', '01/10/2026 08:47', [['veste-coupe-vent-stride', 1, 'Noir · L'], ['sac-de-sport-30l', 1]], 'DELIVERED', 'CASH_ON_DELIVERY', 'Payé'],
];
const FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const REVIEWS: [slug: string, email: string, date: string, rating: number, title: string, comment: string, approved: boolean][] = [
  ['veste-coupe-vent-stride', 'a.leroy@mail.fr', '06/10/2026', 5, 'Top qualité', 'Très légère, coupe bien le vent et tient dans la poche. Livraison rapide.', false],
  ['chaussettes-running-lot-3', 'ines.moreau@mail.fr', '06/10/2026', 5, 'Confortables', 'Bon maintien, aucune ampoule sur mon semi-marathon.', false],
  ['pantalon-yoga-flow', 'julie.l@mail.fr', '04/10/2026', 3, 'Taille un peu grand', 'Joli pantalon, très doux, mais il taille grand : prenez une taille en dessous.', false],
  ['brassiere-maintien-fort', 'lea.dubois@mail.fr', '01/10/2026', 5, 'Maintien parfait', 'Enfin une brassière qui tient vraiment pendant la course, sans frottement.', true],
];

async function reset() {
  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT TABLE_NAME AS name FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME <> '_prisma_migrations'`;
  // Une seule connexion pour que la désactivation des clés étrangères s'applique aux TRUNCATE.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of tables) await tx.$executeRawUnsafe(`TRUNCATE TABLE \`${t.name}\``);
    await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
  }, { timeout: 60_000 });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@pestave.ma';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 10) throw new Error('ADMIN_PASSWORD (10 caractères min.) doit être défini dans .env');

  await reset();

  const admin = await prisma.user.create({
    data: {
      email: adminEmail, passwordHash: await hashPassword(adminPassword),
      firstName: 'Admin', lastName: 'PESTAVE', role: 'ADMIN', emailVerifiedAt: new Date(),
    },
  });

  const refs = await installReferenceData(prisma);
  const prod = await installCatalog(prisma, admin.id, refs);
  const shipping = refs.shipping;
  const brands = refs.brands;
  const cats = refs.cats;

  // Les clients de démonstration ne peuvent pas se connecter (mot de passe aléatoire jeté).
  const customerHash = await hashPassword(randomBytes(24).toString('hex'));
  const users: Record<string, string> = {};
  for (const [name, email, since] of CUSTOMERS) {
    const [firstName, ...rest] = name.split(' ');
    const u = await prisma.user.create({
      data: {
        email, passwordHash: customerHash, firstName, lastName: rest.join(' '), phone: '06 12 34 56 78', createdAt: frDate(since),
        emailVerifiedAt: frDate(since),
        addresses: { create: { firstName, lastName: rest.join(' '), line1: '120 boulevard d’Anfa', city: 'Casablanca', postalCode: '20050', country: 'MA', phone: '06 12 34 56 78', isDefault: true } },
      },
    });
    users[email] = u.id;
  }

  const orders: Record<string, string> = {};
  for (const [number, email, date, items, status, method, pay] of ORDERS) {
    const placedAt = frDate(date);
    const lines = items.map(([slug, quantity, label]) => {
      const p = prod[slug];
      const v = label ? p.variants[label] : undefined;
      if (label && !v) throw new Error(`Déclinaison inconnue : ${slug} ${label}`);
      const unit = v?.unit ?? p.unit;
      return {
        productId: p.id, variantId: v?.id, variantLabel: label ?? null, productName: p.name, sku: v?.sku ?? p.sku,
        unitPriceCents: unit, quantity, totalCents: unit * quantity,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.totalCents, 0);
    const [firstName, ...rest] = CUSTOMERS.find((c) => c[1] === email)![0].split(' ');

    // Historique : progression normale jusqu'au statut actuel, avec annulation / remboursement en fin de chaîne.
    const path: OrderStatus[] = status === 'CANCELLED' ? ['PENDING', 'CANCELLED']
      : status === 'REFUNDED' ? ['PENDING', 'CONFIRMED', 'REFUNDED']
      : FLOW.slice(0, FLOW.indexOf(status) + 1);
    const history = path.map((to, i) => ({
      from: i ? path[i - 1] : null, to, createdAt: addHours(placedAt, i * 6), actorId: i ? admin.id : null,
      note: i ? null : 'Commande passée',
    }));

    const paymentStatus: PaymentStatus = { 'Payé': 'PAID', 'À encaisser': 'PENDING', 'Échoué': 'FAILED', 'Remboursé': 'REFUNDED' }[pay] as PaymentStatus;
    const shipped = status === 'SHIPPED' || status === 'DELIVERED';
    const tracking = 'CA' + number.slice(3) + '01MA';

    const order = await prisma.order.create({
      data: {
        number, userId: users[email], status, paymentStatus, paymentMethod: method,
        subtotalCents: subtotal, shippingCents: 0, totalCents: subtotal, taxCents: Math.round(subtotal - subtotal / 1.2),
        shippingAddress: { firstName, lastName: rest.join(' '), line1: '120 boulevard d’Anfa', city: 'Casablanca', postalCode: '20050', country: 'MA', phone: '06 12 34 56 78' } satisfies Prisma.InputJsonValue,
        shippingMethodId: shipping.id, shippingMethodName: shipping.name,
        placedAt, createdAt: placedAt, cancelledAt: status === 'CANCELLED' ? addHours(placedAt, 6) : null,
        items: { create: lines },
        history: { create: history },
        payments: {
          create: {
            provider: method === 'CARD' ? 'STRIPE' : 'COD', amountCents: subtotal, currency: 'MAD', status: paymentStatus,
            providerPaymentId: method === 'CARD' ? `pi_demo_${number.slice(3)}` : null,
            refundedCents: pay === 'Remboursé' ? subtotal : 0, failureReason: pay === 'Échoué' ? 'Carte refusée' : null,
            paidAt: pay === 'Payé' || pay === 'Remboursé' ? placedAt : null,
            refunds: pay === 'Remboursé' ? { create: { amountCents: subtotal, reason: 'Retour client', status: 'SUCCEEDED', actorId: admin.id } } : undefined,
          },
        },
        shipments: shipped ? {
          create: {
            carrier: 'Amana', trackingNumber: tracking, trackingUrl: null,
            status: status === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT', shippedAt: addHours(placedAt, 18),
            deliveredAt: status === 'DELIVERED' ? addHours(placedAt, 48) : null,
          },
        } : undefined,
      },
    });
    orders[number] = order.id;
  }

  for (const [slug, email, date, rating, title, comment, approved] of REVIEWS) {
    const order = ORDERS.find((o) => o[1] === email && o[3].some(([s]) => s === slug))!;
    await prisma.review.create({
      data: {
        productId: prod[slug].id, userId: users[email], orderId: orders[order[0]], rating, title, comment,
        status: approved ? 'APPROVED' : 'PENDING', createdAt: frDate(date),
        moderatedById: approved ? admin.id : null, moderatedAt: approved ? frDate(date) : null,
      },
    });
  }

  const coupons: [string, DiscountType, number, number, number, number, string, string, boolean][] = [
    ['BIENVENUE10', 'PERCENTAGE', 10, 3000, 500, 184, '2026-01-01', '2026-12-31', true],
    ['NOEL1500', 'FIXED_AMOUNT', dh(1500), 13000, 100, 0, '2026-12-01', '2026-12-26', true],
    ['VIP20', 'PERCENTAGE', 20, 10000, 50, 47, '2026-06-01', '2026-09-30', false],
  ];
  for (const [code, type, value, min, maxUses, usedCount, start, end, isActive] of coupons) {
    await prisma.coupon.create({
      data: {
        code, type, value, minOrderCents: dh(min), maxUses, usedCount, isActive,
        startsAt: new Date(`${start}T00:00:00+02:00`), expiresAt: new Date(`${end}T23:59:59+01:00`),
      },
    });
  }

  await prisma.promotion.create({
    data: {
      name: 'Semaine Running', type: 'PERCENTAGE', value: 15, startsAt: new Date('2026-10-05T00:00:00+02:00'), endsAt: new Date('2026-10-12T23:59:59+02:00'),
      targets: { create: { categoryId: cats.running } },
    },
  });
  const stride = await prisma.collection.findUniqueOrThrow({ where: { slug: 'veste-coupe-vent-stride' } });
  await prisma.promotion.create({
    data: {
      name: 'Lancement Stride', type: 'FIXED_AMOUNT', value: dh(50), startsAt: new Date('2026-10-20T00:00:00+02:00'), endsAt: new Date('2026-11-03T23:59:59+01:00'),
      targets: { create: { collectionId: stride.id } },
    },
  });

  console.log(`Base remplie : ${products.length} articles, ${Object.keys(brands).length} marques, ${CUSTOMERS.length} clients, ${ORDERS.length} commandes, ${REVIEWS.length} avis.`);
  console.log(`Admin : ${adminEmail} (mot de passe : ADMIN_PASSWORD dans .env)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
