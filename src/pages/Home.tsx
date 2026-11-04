import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dial, ICONS, ProductGrid } from '../components/Catalog';
import { useCatalog } from '../catalog';
import { useLayout } from '../layout';
import { productPath, shopPath } from '../routes';

const wrap: React.CSSProperties = { maxWidth: 1360, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase' };

/** Visuels de la maquette (public/looks), à remplacer par vos propres photos. */
const LOOKS = { hero: '/looks/tailleur-oversize.webp', saison: '/looks/veste-militaire.webp', homme: '/looks/veste-chemise.jpg' };

/** Engagements (icônes de la maquette). */
const SERVICES: { t: string; d: string; icon: React.ReactNode }[] = [
  { t: 'Livraison rapide', d: '2 à 4 jours partout au Maroc', icon: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></> },
  { t: 'Échange facile', d: 'Sous 7 jours', icon: <><path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" /><path d="M4 7l8 4 8-4M12 11v10" /></> },
  { t: 'Qualité contrôlée', d: 'Chaque pièce vérifiée', icon: <><circle cx="12" cy="12" r="8" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { t: 'Paiement à la livraison', d: 'Ou par virement bancaire', icon: <><rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V8a4 4 0 018 0v3" /></> },
];

function Hero() {
  const L = useLayout();
  return (
    <section style={{ overflow: 'hidden' }}>
      <div style={{ ...wrap, paddingTop: L.mobile ? 16 : 36, paddingBottom: L.mobile ? 40 : 56, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 40 }}>
        <div data-reveal style={{ flex: '1 1 520px', minWidth: 0, order: L.mobile ? 2 : 1, containerType: 'inline-size', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: '.32em', lineHeight: 1.9 }}>LA MODE<br />QUI AVANCE<br />AVEC VOUS.</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, letterSpacing: '.32em', lineHeight: 1.9, textAlign: 'right', color: 'var(--graphite)' }}>COLLECTION<br />2026</p>
          </div>
          <h1 className="display" style={{ fontWeight: 800, fontSize: 'clamp(64px, 23cqw, 200px)', lineHeight: 0.84, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Vasy<br />ciao</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <p style={{ margin: 0, maxWidth: 380, fontSize: 16, lineHeight: 1.65, color: 'var(--muted)' }}>Des coupes amples, des matières nobles et des basiques bien faits, pour femme et homme.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
              <Link className="btn btn-primary" to={shopPath('all')}>Acheter la collection</Link>
              <Link className="link-underline" to={shopPath('new')}>Nouveautés</Link>
            </div>
          </div>
        </div>
        <figure style={{ flex: '0 1 468px', minWidth: 0, margin: 0, order: L.mobile ? 1 : 2, position: 'relative' }}>
          <Link to={productPath('tailleur-oversize')} aria-label="Voir le tailleur oversize">
            <img src={LOOKS.hero} alt="Mannequin en tailleur noir oversize au bord de la mer" fetchPriority="high" style={{ width: '100%', height: L.mobile ? 460 : 600, objectFit: 'cover', objectPosition: 'center 12%', display: 'block' }} />
          </Link>
          <figcaption style={{ position: 'absolute', left: 0, bottom: 0, background: 'var(--ivory)', padding: '10px 14px 0 0', fontSize: 11, fontWeight: 600, letterSpacing: '.18em' }}>01 — TAILLEUR OVERSIZE</figcaption>
        </figure>
      </div>
    </section>
  );
}

type Filter = 'Tout' | 'Femme' | 'Homme';

export default function Home() {
  const L = useLayout();
  const { products, imageFor } = useCatalog();
  const [filter, setFilter] = useState<Filter>('Tout');
  const best = useMemo(
    () => (filter === 'Tout' ? products : products.filter((p) => p.cats.includes(filter === 'Femme' ? 'femme' : 'homme'))).slice(0, 8),
    [products, filter],
  );
  // Univers : photo de la catégorie (Admin → Catégories), sinon les visuels de la maquette.
  const univers = [
    { name: 'Femme', sub: 'Des pièces fortes, faciles à porter.', to: shopPath('femme'), img: LOOKS.saison, pos: 'center 20%' },
    { name: 'Homme', sub: 'Les classiques, revus avec style.', to: shopPath('homme'), img: LOOKS.homme, pos: 'center top' },
    { name: 'Essentiels', sub: 'T-shirts, hoodies, pulls et chemises.', to: shopPath('hauts'), img: imageFor('hauts'), pos: 'center' },
  ];

  return (
    <>
      <Hero />

      <section id="saison" style={{ background: 'var(--stone)' }}>
        <div style={{ ...wrap, display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'stretch', gap: '0 48px' }}>
          <Link to={productPath('veste-militaire')} style={{ flex: '1.3 1 420px', minWidth: 0, display: 'block' }} aria-label="Voir la veste militaire">
            <img src={LOOKS.saison} alt="Femme en veste militaire kaki à brandebourgs noirs" loading="lazy" style={{ width: '100%', height: L.mobile ? 440 : 560, objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }} />
          </Link>
          <div data-reveal style={{ flex: '1 1 360px', minWidth: 0, padding: '64px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
            <p className="eyebrow" style={{ color: 'var(--ink)' }}>Nouvelle saison</p>
            <h2 className="display" style={{ fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.02em' }}>NOUVELLES<br />ALLURES</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: '#2E2E2E', maxWidth: 340 }}>Vestes structurées, kaki et noir profond : les pièces fortes qui viennent d’arriver, pour elle et pour lui.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
              <Link className="btn btn-primary" to={shopPath('vestes')}>Découvrir</Link>
              <Link className="link-underline" to={shopPath('new')}>Tout voir</Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Catégories" className="dark">
        <div style={{ ...wrap, paddingTop: 64, paddingBottom: 64 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 28 }}>
            <h2 className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '.08em' }}>ACHETER PAR UNIVERS</h2>
            <span style={{ fontSize: 12, letterSpacing: '.16em', color: 'var(--graphite)' }}>FEMME · HOMME · ESSENTIELS</span>
          </div>
          <div data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            {univers.map((c) => (
              <Link key={c.name} to={c.to} className="card" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4 / 5', overflow: 'hidden', color: '#FFFFFF', background: '#2A2A2A' }}>
                {c.img
                  ? <img className="zoom-hover" src={c.img} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos, display: 'block' }} />
                  : <Dial size="30%" path={ICONS.hauts} />}
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '72px 22px 22px', background: 'linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,0))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--display-font)', fontStretch: '112%', fontSize: 28, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: '#E2E2DE' }}>{c.sub}</span>
                  </span>
                  <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', border: '1px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Nos services" style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...wrap, paddingTop: 32, paddingBottom: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 24 }}>
          {SERVICES.map((sv) => (
            <div key={sv.t} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>{sv.icon}</svg>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>{sv.t}</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--graphite)' }}>{sv.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="best" style={{ background: 'var(--paper)' }}>
        <div style={{ ...wrap, paddingTop: 72, paddingBottom: 88 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="eyebrow">Sélection</p>
              <h2 className="display" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Le meilleur de Vasyciao</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <div role="group" aria-label="Filtrer" style={{ display: 'flex', border: '1px solid var(--ink)' }}>
                {(['Tout', 'Femme', 'Homme'] as Filter[]).map((f) => (
                  <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}
                    style={{ ...label, height: 44, padding: '0 20px', fontSize: 11, border: 0, cursor: 'pointer', background: filter === f ? 'var(--ink)' : 'transparent', color: filter === f ? '#FFFFFF' : 'var(--ink)' }}>{f}</button>
                ))}
              </div>
              <Link to={shopPath(filter === 'Femme' ? 'femme' : filter === 'Homme' ? 'homme' : 'all')} style={{ ...label, fontSize: 11, padding: '14px 4px' }}>Tout voir →</Link>
            </div>
          </div>
          <ProductGrid items={best} />
        </div>
      </section>
    </>
  );
}
