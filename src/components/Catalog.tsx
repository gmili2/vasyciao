import { Link, useNavigate } from 'react-router-dom';
import { COLLECTIONS, badgeOf, fmt, type Product } from '../data';
import { useCatalog } from '../catalog';
import { useLayout } from '../layout';
import { productPath, shopPath } from '../routes';
import { useStore } from '../store';
import { ArrowIcon, HeartIcon } from './icons';

/** Silhouettes des rayons — visuel provisoire tant qu'un article n'a pas de photo. */
export const ICONS = {
  // Veste, t-shirt, pantalon, robe, sac.
  vestes: 'M8 3l4 3 4-3 5 3-2 5-2-1v11H7V10l-2 1-2-5 5-3zM12 6v15',
  hauts: 'M8 3h2c.5 2 1.2 3 2 3s1.5-1 2-3h2l5 3-2 4-3-1v12H8V9l-3 1-2-4 5-3z',
  pantalons: 'M7 3h10l-1 18h-3l-1-12-1 12H8L7 3z',
  robes: 'M9 3h6l-1 4 4 14H6l4-14-1-4z',
  accessoires: 'M4 9h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1V9zM9 9V6a3 3 0 016 0v3M4 13h16',
};
export const iconOf = (p: Pick<Product, 'cats'>) =>
  ICONS[(p.cats.find((c) => c in ICONS) as keyof typeof ICONS | undefined) ?? 'hauts'];

export function Dial({ size = '50%', path = ICONS.hauts }: { size?: string; dark?: boolean; path?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="#8C8C8A" strokeWidth="1" strokeLinejoin="round" style={{ width: size, maxWidth: 120 }}>
      <path d={path} />
    </svg>
  );
}

/** Public de l'article : femme, homme ou les deux. */
export const whoOf = (p: Pick<Product, 'cats'>) =>
  p.cats.includes('femme') && p.cats.includes('homme') ? 'Mixte' : p.cats.includes('femme') ? 'Femme' : p.cats.includes('homme') ? 'Homme' : '';

export function ProductCard({ p }: { p: Product }) {
  const L = useLayout();
  const navigate = useNavigate();
  const { add, favs, toggleFav } = useStore();
  const fav = favs.includes(p.id);
  const tag = p.inStock ? badgeOf(p) : 'Épuisé';
  const needsChoice = p.variants.length > 1;
  const canBuy = p.inStock && p.purchasable;
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div style={{ position: 'relative', aspectRatio: '3 / 4', background: 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Link to={productPath(p.id)} aria-label={p.name} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.image
            ? <img className="zoom-hover" src={p.image} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            : <Dial size="34%" path={iconOf(p)} />}
        </Link>
        {tag && <span style={{ position: 'absolute', zIndex: 2, top: 12, left: 12, background: p.inStock ? '#FFFFFF' : '#111111', color: p.inStock ? (p.old ? 'var(--sale)' : '#111111') : '#FFFFFF', fontSize: 10, fontWeight: 600, letterSpacing: '.18em', padding: '6px 9px', textTransform: 'uppercase' }}>{tag}</span>}
        <button
          onClick={() => toggleFav(p.id)} aria-label={fav ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`} aria-pressed={fav}
          style={{ position: 'absolute', zIndex: 2, top: 4, right: 4, width: 44, height: 44, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HeartIcon size={15} color="#111111" fill={fav ? '#111111' : 'none'} /></span>
        </button>
        {canBuy && (
          <button
            className="btn btn-dark"
            // Avec plusieurs déclinaisons (taille, couleur…), le choix se fait sur la fiche.
            onClick={() => { if (needsChoice) navigate(productPath(p.id)); else add(p.id, 1, p.variants[0]?.id); }}
            style={{ position: 'absolute', zIndex: 2, left: 10, right: 10, bottom: 10, height: 44, padding: '0 8px', fontSize: 11 }}
          >
            {needsChoice ? (L.mobile ? 'Choisir' : 'Choisir la taille') : (L.mobile ? 'Ajouter' : 'Ajouter au panier')}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {whoOf(p) && <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.16em', color: 'var(--graphite)', textTransform: 'uppercase' }}>{whoOf(p)}</span>}
        {/* Vrai lien : les moteurs de recherche suivent les liens pour trouver les fiches. */}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}><Link to={productPath(p.id)}>{p.name}</Link></h3>
        <span style={{ display: 'flex', gap: 8, fontSize: 14, fontWeight: 600 }}>
          <span style={p.old ? { color: 'var(--sale)' } : undefined}>{p.hasRange ? 'dès ' : ''}{fmt(p.price)}</span>
          {p.old && <span style={{ color: 'var(--graphite)', fontWeight: 400, textDecoration: 'line-through' }}>{fmt(p.old)}</span>}
        </span>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  const L = useLayout();
  const { status, reload } = useCatalog();
  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 21vw, 260px), 1fr))', gap: L.mobile ? '28px 12px' : '36px 20px' };
  if (status === 'loading' && !items.length) {
    return (
      <div style={grid} aria-busy="true" aria-label="Chargement des articles">
        {[0, 1, 2, 3].map((i) => <div key={i} className="ph" style={{ aspectRatio: '3/4', opacity: 0.6 }} />)}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <p style={{ margin: 0, fontSize: 15.5, color: 'var(--muted)' }}>Le catalogue est momentanément indisponible.</p>
        <button className="btn btn-outline" onClick={reload} style={{ height: 48, padding: '0 24px' }}>Réessayer</button>
      </div>
    );
  }
  return (
    <div data-reveal style={grid}>
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

export function CollectionsGrid() {
  const L = useLayout();
  const { imageFor, hidden } = useCatalog();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: L.g3, gap: L.gap }}>
      {COLLECTIONS.filter((c) => !hidden(c.id)).map((c) => {
        const img = c.id === 'all' ? undefined : imageFor(c.id);
        return (
        <Link key={c.id} to={shopPath(c.id)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ph" style={{ width: '100%', aspectRatio: L.collRatio, backgroundImage: 'none', overflow: 'hidden' }}>
            {img ? (
              <img className="zoom-hover" src={img} alt={c.label} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <div className="ph zoom-hover" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '40%', aspectRatio: '1', borderRadius: '50%', border: '1px solid #3A3A3A' }} />
                </div>
                <span className="ph-caption" style={{ left: 14, bottom: 12, fontSize: 9.5, letterSpacing: '.12em' }}>photo · {c.img}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span className="display" style={{ fontSize: L.mobile ? 20 : 28, color: 'var(--ink)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{c.label}</span>
              {L.desktop && <span style={{ fontSize: 13.5, color: 'var(--graphite)' }}>{c.sub}</span>}
            </div>
            <span style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowIcon size={14} />
            </span>
          </div>
        </Link>
        );
      })}
    </div>
  );
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span className="mono" style={style}>{children}</span>;
}

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Fil d’Ariane" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, letterSpacing: '.08em', color: 'var(--graphite)' }}>
      {items.map(([label, to], i) => (
        <span key={label} style={{ display: 'flex', gap: 10 }}>
          {i > 0 && <span>/</span>}
          {to ? <Link to={to} style={{ color: 'var(--graphite)' }}>{label}</Link> : <span style={{ color: 'var(--ink)' }}>{label}</span>}
        </span>
      ))}
    </nav>
  );
}
