import { Link, useNavigate } from 'react-router-dom';
import { COLLECTIONS, badgeOf, fmt, type Product } from '../data';
import { useCatalog } from '../catalog';
import { useLayout } from '../layout';
import { productPath, shopPath } from '../routes';
import { useTilt } from '../tilt';
import { useStore } from '../store';
import { ArrowIcon, HeartIcon } from './icons';

/** Silhouettes des rayons (maquette) — visuel provisoire tant qu'un article n'a pas de photo. */
export const ICONS = {
  // T-shirt, short, maillot, legging, sac.
  training: 'M8 3h2c.5 2 1.2 3 2 3s1.5-1 2-3h2l5 3-2 4-3-1v12H8V9l-3 1-2-4 5-3z',
  running: 'M5 4h14l1 16h-6l-2-8-2 8H4L5 4z',
  football: 'M8 3h8l5 3-2 4-3-1v12H8V9l-3 1-2-4 5-3zM10 12h4M12 10v4',
  yoga: 'M7 3h10l-1 18h-3l-1-12-1 12H8L7 3z',
  accessoires: 'M4 9h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1V9zM9 9V6a3 3 0 016 0v3M4 13h16',
};export const iconOf = (p: Pick<Product, 'cats'>) =>
  ICONS[(p.cats.find((c) => c in ICONS) as keyof typeof ICONS | undefined) ?? 'training'];

export function Dial({ size = '50%', path = ICONS.training }: { size?: string; dark?: boolean; path?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="#8A8D95" strokeWidth="1.2" strokeLinejoin="round" style={{ width: size, maxWidth: 120 }}>
      <path d={path} />
    </svg>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const navigate = useNavigate();
  const { add, favs, toggleFav } = useStore();
  const fav = favs.includes(p.id);
  const badge = p.inStock ? badgeOf(p) : 'Épuisé';
  const needsChoice = p.variants.length > 1;
  const tilt = useTilt<HTMLDivElement>();
  return (
    <article className="card" onClick={() => navigate(productPath(p.id))} style={{ display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer', minWidth: 0 }}>
      <div ref={tilt} className="ph tilt card-frame" style={{ aspectRatio: '4/5', backgroundImage: 'none', overflow: 'hidden' }}>
        <div className="zoom-hover" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--card)' }}>
          {p.image
            ? <img src={p.image} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <Dial size="34%" path={iconOf(p)} />}
        </div>
        <span className="tilt-glare" />
        {badge && (
          <span style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: p.inStock ? 'var(--accent)' : '#4A4D55', color: p.inStock ? '#0D0E11' : '#F2F1EC', fontSize: 12, fontWeight: 600, borderRadius: 999 }}>{badge}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
          aria-label={fav ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`} aria-pressed={fav}
          style={{ position: 'absolute', top: 8, right: 8, width: 44, height: 44, borderRadius: '50%', border: 0, background: 'rgba(242,241,236,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <HeartIcon fill={fav ? '#0D0E11' : 'none'} color="#0D0E11" />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          {/* Vrai lien (et pas seulement le clic sur la carte) : les moteurs de recherche suivent les liens pour trouver les fiches. */}
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>
            <Link to={productPath(p.id)} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit' }}>{p.name}</Link>
          </h3>
          <span style={{ fontSize: 14, color: 'var(--graphite)' }}>{p.kind}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{p.hasRange ? 'dès ' : ''}{fmt(p.price)}</span>
          {p.old && <span style={{ fontSize: 13, color: 'var(--graphite)', textDecoration: 'line-through' }}>{fmt(p.old)}</span>}
        </div>
      </div>
      {p.swatches.length > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label={`Couleurs : ${p.swatches.map((s) => s.label).join(', ')}`}>
          {p.swatches.slice(0, 5).map((s) => (
            <span key={s.label} title={s.label} style={{ width: 14, height: 14, borderRadius: '50%', background: s.colorHex ?? '#FFFFFF', boxShadow: 'inset 0 0 0 1px rgba(13,14,17,.2)' }} />
          ))}
          {p.swatches.length > 5 && <span style={{ fontSize: 12, color: 'var(--graphite)' }}>+{p.swatches.length - 5}</span>}
        </div>
      )}
      {p.inStock && p.purchasable && (
        <button
          className="btn btn-dark"
          // Avec plusieurs déclinaisons (taille, couleur…), le choix se fait sur la fiche.
          onClick={(e) => { e.stopPropagation(); if (needsChoice) navigate(productPath(p.id)); else add(p.id, 1, p.variants[0]?.id); }}
          style={{ height: 44, padding: '0 16px', fontSize: 14 }}
        >
          {needsChoice ? 'Choisir la taille' : 'Ajouter au panier'}
        </button>
      )}
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  const L = useLayout();
  const { status, reload } = useCatalog();
  if (status === 'loading' && !items.length) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: L.g4, columnGap: L.gap, rowGap: L.rowGap }} aria-busy="true" aria-label="Chargement des articles">
        {[0, 1, 2, 3].map((i) => <div key={i} className="ph card-frame" style={{ aspectRatio: '4/5', opacity: 0.6 }} />)}
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
    <div data-reveal style={{ display: 'grid', gridTemplateColumns: L.g4, columnGap: L.gap, rowGap: L.rowGap }}>
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
                  <div style={{ width: '40%', aspectRatio: '1', borderRadius: '50%', border: '1px solid rgba(13,14,17,.12)' }} />
                </div>
                <span className="ph-caption" style={{ left: 14, bottom: 12, fontSize: 9.5, letterSpacing: '.12em' }}>photo · {c.img}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontStretch: '125%', fontWeight: 600, fontSize: L.cardT, textTransform: 'uppercase', letterSpacing: '.01em', color: 'var(--ink)' }}>{c.label}</span>
              {L.desktop && <span style={{ fontSize: 13.5, color: 'var(--graphite)' }}>{c.sub}</span>}
            </div>
            <span style={{ flex: 'none', width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <nav aria-label="Fil d’Ariane" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--graphite)' }}>
      {items.map(([label, to], i) => (
        <span key={label} style={{ display: 'flex', gap: 10 }}>
          {i > 0 && <span>/</span>}
          {to ? <Link to={to} style={{ color: 'var(--graphite)' }}>{label}</Link> : <span style={{ color: 'var(--ink)' }}>{label}</span>}
        </span>
      ))}
    </nav>
  );
}
