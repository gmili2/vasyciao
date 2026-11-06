import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProductGrid, whoOf } from '../components/Catalog';
import { useCatalog } from '../catalog';
import { useLayout } from '../layout';
import { productPath, shopPath } from '../routes';

const wrap: React.CSSProperties = { maxWidth: 1440, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };
const mono: React.CSSProperties = { fontFamily: 'var(--mono)' };
const line = '1px solid var(--line)';

/** Photos de l'ouverture Femme / Homme (public/looks), à remplacer par vos propres visuels. */
const HERO = [
  { id: 'femme' as const, n: '01', img: '/looks/tailleur-oversize.webp', alt: 'Femme en tailleur noir oversize', pos: 'center 15%', light: false },
  { id: 'homme' as const, n: '02', img: '/looks/veste-chemise.jpg', alt: 'Homme en veste chemise noire et pantalon large', pos: 'center 25%', light: true },
];

function Hero() {
  const L = useLayout();
  return (
    <section aria-label="Femme et homme" style={{ display: 'flex', flexWrap: 'wrap', borderBottom: line }}>
      {HERO.map((h, i) => (
        <Link
          key={h.id} to={shopPath(h.id)}
          style={{ flex: '1 1 520px', minWidth: 0, position: 'relative', height: L.mobile ? 520 : 760, overflow: 'hidden', display: 'block', background: h.light ? '#E9E9E6' : '#1A1A1A', borderRight: i === 0 ? line : undefined }}
        >
          <img src={h.img} alt={h.alt} fetchPriority={i === 0 ? 'high' : undefined} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: h.pos, display: 'block' }} />
          <span style={{ ...mono, position: 'absolute', top: 20, left: 24, fontSize: 12, color: '#FFFFFF', background: '#0B0B0B', padding: '6px 10px' }}>{h.n} / {h.id.toUpperCase()}</span>
          <span style={{ position: 'absolute', left: 24, right: 24, bottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
            <span style={{ fontFamily: 'var(--display-font)', fontSize: 'clamp(72px, 9vw, 150px)', lineHeight: 0.85, color: h.light ? '#0B0B0B' : '#FFFFFF' }}>{h.id.toUpperCase()}</span>
            <span style={{ ...mono, flex: 'none', fontSize: 13, background: h.light ? '#0B0B0B' : '#F5F5F3', color: h.light ? '#F5F5F3' : '#0B0B0B', padding: '12px 16px' }}>VOIR →</span>
          </span>
        </Link>
      ))}
    </section>
  );
}

type Filter = 'Tout' | 'Femme' | 'Homme';

export default function Home() {
  const { products } = useCatalog();
  const { hash } = useLocation();
  const [filter, setFilter] = useState<Filter>('Tout');

  // Lien « Lookbook » du menu (/#lookbook) : défile jusqu'à la section.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => clearTimeout(t);
  }, [hash, products.length]);

  // Lookbook : trois silhouettes, les premiers articles qui ont une photo.
  const looks = useMemo(() => products.filter((p) => p.image).slice(0, 3), [products]);
  const shop = useMemo(
    () => (filter === 'Tout' ? products : products.filter((p) => p.cats.includes(filter === 'Femme' ? 'femme' : 'homme'))).slice(0, 8),
    [products, filter],
  );

  return (
    <>
      <Hero />

      <section aria-label="Manifeste" style={{ borderBottom: line }}>
        <div data-reveal style={{ ...wrap, paddingTop: 72, paddingBottom: 72, display: 'flex', flexWrap: 'wrap', gap: '32px 64px', alignItems: 'flex-end' }}>
          <h1 className="display" style={{ flex: '3 1 560px', minWidth: 0, fontSize: 'clamp(48px, 6.4vw, 104px)', lineHeight: 0.95 }}>
            Porter l’essentiel.<br /><span style={{ color: '#8C8C8C' }}>Sans compromis.</span>
          </h1>
          <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: 'var(--muted)' }}>Vasyciao, c’est du noir, du blanc, et des coupes qui tiennent. Pour femme et homme, pensé pour durer plus d’une saison.</p>
            <Link to={shopPath('all')} style={{ ...mono, alignSelf: 'flex-start', fontSize: 13, border: '1px solid #F5F5F3', padding: '14px 20px' }}>ACHETER LA COLLECTION →</Link>
          </div>
        </div>
      </section>

      {looks.length > 0 && (
        <section id="lookbook" aria-label="Lookbook" style={{ borderBottom: line, scrollMarginTop: 80 }}>
          <div style={{ ...wrap, paddingTop: 56, paddingBottom: 64 }}>
            <div style={{ ...mono, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 28, fontSize: 13 }}>
              <span>LOOKBOOK — SAISON 2026</span>
              <span style={{ color: '#8C8C8C' }}>{String(looks.length).padStart(2, '0')} SILHOUETTE{looks.length > 1 ? 'S' : ''}</span>
            </div>
            <div data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
              {looks.map((p, i) => (
                <Link key={p.id} to={productPath(p.id)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ position: 'relative', display: 'block', aspectRatio: '4 / 5', overflow: 'hidden', background: '#1A1A1A' }}>
                    <img className="zoom-hover" src={p.image} alt={p.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: i < 2 ? 'grayscale(1)' : 'none', display: 'block' }} />
                  </span>
                  <span style={{ ...mono, display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                    <span>{String(i + 1).padStart(2, '0')} — {p.name}</span>
                    <span style={{ color: '#8C8C8C', textTransform: 'uppercase' }}>{whoOf(p) === 'Mixte' ? 'Essentiel' : whoOf(p)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="shop" aria-label="Shop" style={{ borderBottom: line }}>
        <div style={{ ...wrap, paddingTop: 56, paddingBottom: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
          <h2 className="display" style={{ fontSize: 'clamp(56px, 7vw, 112px)', lineHeight: 0.9 }}>Shop</h2>
          <div role="group" aria-label="Filtrer" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['Tout', 'Femme', 'Homme'] as Filter[]).map((f) => (
              <button key={f} className={`chip${filter === f ? ' active' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>[ {f} ]</button>
            ))}
          </div>
        </div>
        <ProductGrid items={shop} />
        <div style={{ ...wrap, paddingTop: 28, paddingBottom: 56, display: 'flex', justifyContent: 'center' }}>
          <Link className="btn btn-outline" to={shopPath(filter === 'Femme' ? 'femme' : filter === 'Homme' ? 'homme' : 'all')}>Voir tout le shop →</Link>
        </div>
      </section>
    </>
  );
}
