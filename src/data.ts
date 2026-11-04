export type CategoryId = 'all' | 'homme' | 'femme' | 'vestes' | 'hauts' | 'pantalons' | 'robes' | 'accessoires' | 'new' | 'promo';

export interface Swatch {
  label: string;
  colorHex: string | null;
}

export interface Variant {
  id: string;
  sku: string;
  values: Swatch[];
  price: number;
  old: number | null;
  inStock: boolean;
  lowStock: boolean;
  imageUrl: string | null; // photo propre à cette déclinaison (couleur)
}

/** Article tel qu'affiché en boutique (chargée depuis l'API, voir catalog.tsx). */
export interface Product {
  id: string; // slug, utilisé dans les URL
  sku: string;
  name: string;
  brand?: string; // grande maison (absent pour les articles VASYCIAO)
  col: string;
  kind: string;
  cats: Exclude<CategoryId, 'all'>[];
  price: number; // prix payé (le plus bas des déclinaisons s'il y en a)
  old: number | null; // prix barré
  hasRange: boolean; // prix différents selon la déclinaison (« dès … »)
  rating: number;
  reviews: number;
  inStock: boolean;
  purchasable: boolean; // false : présentée en vitrine, non disponible à la vente
  stock: string;
  movement: string;
  dims: string;
  strap: string;
  glass: string;
  water: string;
  desc: string;
  publishedAt: string | null;
  options: { name: string; values: Swatch[] }[];
  variants: Variant[];
  swatches: Swatch[];
  image?: string; // photo principale
  photos: string[]; // toutes les photos, la principale en premier
  videos: string[]; // vidéos, affichées après les photos sur la fiche
  qtyTiers: { minQty: number; amount: number }[]; // remise propre à ce modèle (dès N exemplaires) ; vide : remise générale
}

export const CATS: Record<CategoryId, [string, string]> = {
  all: ['Shop', 'Du noir, du blanc, et des coupes qui tiennent. Pour femme et homme.'],
  homme: ['Homme', 'Vestes, chemises, pulls et pantalons pour homme.'],
  femme: ['Femme', 'Tailleurs, vestes, blouses, robes et pantalons pour femme.'],
  vestes: ['Vestes', 'Tailleurs, vestes chemises et vestes militaires.'],
  hauts: ['Hauts', 'T-shirts, chemises, blouses, pulls et hoodies.'],
  pantalons: ['Pantalons', 'Pantalons larges à pinces et pantalons tailleur.'],
  robes: ['Robes', 'Robes longues et fluides.'],
  accessoires: ['Accessoires', 'Sacs et accessoires Vasyciao.'],
  new: ['Nouveautés', 'Les dernières pièces arrivées en boutique.'],
  promo: ['Promos', 'Les meilleures affaires du moment.'],
};

/** Rayons de la page Collections. */
export const COLLECTIONS: { id: CategoryId; label: string; sub: string; img: string }[] = [
  { id: 'vestes', label: 'Vestes', sub: 'Tailleurs, vestes chemises, militaires', img: 'vestes' },
  { id: 'hauts', label: 'Hauts', sub: 'T-shirts, chemises, pulls', img: 'hauts' },
  { id: 'pantalons', label: 'Pantalons', sub: 'Larges, à pinces, tailleur', img: 'pantalons' },
  { id: 'robes', label: 'Robes', sub: 'Longues et fluides', img: 'robes' },
];

export const FAQ: [string, string][] = [
  ['Quels sont les délais de livraison ?', 'Expédition sous 24 h ouvrées, livraison en 2 à 4 jours partout au Maroc.'],
  ['Comment choisir ma taille ?', 'Nos vestes, pulls et t-shirts ont une coupe ample : prenez votre taille habituelle pour l\u2019effet oversize, une taille en dessous pour un tombé plus ajusté. Les pantalons tailleur taillent normalement.'],
  ['Puis-je échanger une taille ?', 'Oui, sous 7 jours après réception, si l\u2019article n\u2019a pas été porté et garde ses étiquettes.'],
  ['Comment entretenir mes pièces ?', 'Chaque fiche produit indique la matière et l\u2019entretien conseillé. Lavez le noir sur l\u2019envers, à 30 °C, pour qu\u2019il garde sa profondeur.'],
  ['Quels moyens de paiement acceptez-vous ?', 'Le paiement à la livraison, en espèces à la réception du colis, ou le virement bancaire : la commande est alors expédiée dès réception du virement.'],
];

export const LEGAL: Record<'cgv' | 'privacy', { title: string; updated: string; sections: [string, string][] }> = {
  cgv: {
    title: 'Conditions générales de vente',
    updated: 'Mise à jour : octobre 2026',
    sections: [
      ['Objet', 'Les présentes conditions régissent les ventes de vêtements et accessoires réalisées sur le site VASYCIAO auprès de clients particuliers.'],
      ['Prix', 'Les prix sont indiqués en dirhams marocains (DH), toutes taxes et livraison comprises, partout au Maroc.'],
      ['Commande', 'La commande est enregistrée dès sa validation sur le site ; nous vous contactons par téléphone pour la confirmer. Elle récapitule les articles, le prix et l\u2019adresse de livraison.'],
      ['Paiement', 'Le paiement s\u2019effectue à la livraison, en espèces, ou par virement bancaire avant expédition. En cas de virement, la commande est expédiée dès réception des fonds.'],
      ['Livraison', 'Les articles sont expédiés sous 24 h ouvrées (après réception du virement le cas échéant), assurées pendant le transport et remises en main propre.'],
      ['Rétractation', 'Vous disposez de 30 jours à compter de la réception pour échanger un article non porté, dans son emballage d\u2019origine.'],
      ['Garantie', 'Nos articles bénéficient des garanties légales de conformité et des vices cachés.'],
    ],
  },
  privacy: {
    title: 'Politique de confidentialité',
    updated: 'Mise à jour : octobre 2026',
    sections: [
      ['Données collectées', 'Identité, coordonnées, adresse de livraison et historique de commandes. Aucune donnée de carte bancaire n\u2019est collectée sur le site.'],
      ['Finalités', 'Traitement des commandes, service client, suivi des échanges et, avec votre accord, envoi de la newsletter.'],
      ['Conservation', 'Les données sont conservées pendant la durée de la relation commerciale, puis archivées selon les obligations légales.'],
      ['Vos droits', 'Vous disposez d\u2019un droit d\u2019accès, de rectification, d\u2019effacement et d\u2019opposition, exerçable à tout moment auprès de notre service client.'],
      ['Cookies', 'Des cookies techniques assurent le fonctionnement du site ; les cookies de mesure d\u2019audience ne sont déposés qu\u2019avec votre consentement.'],
      ['Contact', 'Pour toute question relative à vos données : contact@vasyciao.ma.'],
    ],
  },
};

export const PILLARS = [
  { n: '01', t: 'Livraison rapide', d: '2 à 4 jours partout au Maroc.' },
  { n: '02', t: 'Échange de taille', d: 'Sous 7 jours, article non porté.' },
  { n: '03', t: 'Paiement à la livraison', d: 'Ou par virement bancaire.' },
  { n: '04', t: 'Service client', d: 'On répond à tes questions.' },
];

/** Prix en dirhams marocains : « 13 900 DH ». */
export const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' DH';
export const stars = (r: number) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
export const ratingF = (r: number) => r.toFixed(1).replace('.', ',');
export const refOf = (p: Product) => 'VC-' + p.id.slice(0, 6).toUpperCase();
export const isNew = (p: Product) => p.cats.includes('new');
export const badgeOf = (p: Product) =>
  p.old ? '−' + Math.round((1 - p.price / p.old) * 100) + ' %' : isNew(p) ? 'Nouveau' : '';

/** Numéro WhatsApp de la boutique, format international sans « + » (ex. 212600000000). Vide : liens vers la page contact. */
export const WHATSAPP = '';
