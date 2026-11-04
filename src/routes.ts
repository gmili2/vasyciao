import type { CategoryId } from './data';

const SLUGS: Record<Exclude<CategoryId, 'all'>, string> = {
  homme: 'homme',
  femme: 'femme',
  running: 'running',
  training: 'training',
  football: 'football',
  yoga: 'yoga',
  accessoires: 'accessoires',
  new: 'nouveautes',
  promo: 'promos',
};

export const shopPath = (cat: CategoryId = 'all') => (cat === 'all' ? '/produits' : `/produits/${SLUGS[cat]}`);
export const productPath = (id: string) => `/produit/${id}`;

export function catFromSlug(slug?: string): CategoryId | null {
  if (!slug) return 'all';
  const hit = (Object.keys(SLUGS) as Exclude<CategoryId, 'all'>[]).find((k) => SLUGS[k] === slug);
  return hit ?? null;
}

export const PATHS = {
  home: '/',
  admin: '/admin',
  collections: '/collections',
  cart: '/panier',
  checkout: '/commande',
  about: '/a-propos',
  contact: '/contact',
  faq: '/faq',
  cgv: '/cgv',
  privacy: '/confidentialite',
  account: '/compte',
};
