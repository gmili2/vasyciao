import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ICONS, ProductGrid } from '../components/Catalog';
import { Logo } from '../components/Shell';
import { useCatalog } from '../catalog';
import { COLLECTIONS, PILLARS, fmt } from '../data';
import { useLayout } from '../layout';
import { productPath, shopPath } from '../routes';
import { useTilt } from '../tilt';

const wrap = (px: string): React.CSSProperties => ({ maxWidth: 1320, margin: '0 auto', paddingLeft: px, paddingRight: px });

/** Icônes des engagements (maquette) : livraison, échange, paiement, service client. */
const PILLAR_ICONS = [
  <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></>,
  <><path d="M4 12a8 8 0 1 0 2.5-5.8" /><path d="M4 4v4h4" /></>,
  <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
];

function Hero() {
  const L = useLayout();
  const { products } = useCatalog();
  // Article mis en avant : le premier commandable avec une photo.
  const hero = products.find((p) => p.purchasable && p.image) ?? products.find((p) => p.image) ?? products[0];
  const tilt = useTilt<HTMLAnchorElement>(5);
  return (
    <section className="dark">
      <div style={{ ...wrap(L.mobile ? '20px' : '24px'), paddingTop: L.mobile ? 32 : 48, paddingBottom: L.mobile ? 48 : 72, display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'stretch' }}>
        <div data-reveal style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
          <p className="eyebrow">Nouvelle collection</p>
          <h1 className="display" style={{ fontSize: 'clamp(64px, 9vw, 132px)', lineHeight: 0.88, letterSpacing: '-1px' }}>
            Bouge<br />sans<br />limite.
          </h1>
          <p style={{ margin: 0, maxWidth: 460, fontSize: 18, lineHeight: 1.55, color: 'var(--muted)' }}>
            Des vêtements de sport pensés pour l’effort : respirants, légers et faits pour suivre chacun de tes mouvements.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link className="btn btn-primary" to={shopPath('homme')}>Acheter Homme</Link>
            <Link className="btn btn-ghost-light" to={shopPath('femme')}>Acheter Femme</Link>
          </div>
        </div>
        <Link
          ref={tilt} data-reveal to={hero ? productPath(hero.id) : shopPath('all')} aria-label={hero ? `Voir ${hero.name}` : 'Voir la boutique'} className="tilt"
          style={{ flex: '1 1 520px', minWidth: 0, minHeight: L.mobile ? 420 : 560, background: '#1C1E24', borderRadius: 20, display: 'flex', alignItems: 'flex-end', padding: 24, position: 'relative', overflow: 'hidden' }}
        >
          {hero?.image
            ? <img src={hero.image} alt={hero.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}><Logo size={L.mobile ? 160 : 240} /></span>}
          <span className="tilt-glare" />
          {hero && (
            <span style={{ position: 'relative', background: '#F2F1EC', color: '#0D0E11', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'center', maxWidth: '100%' }}>
              <span style={{ width: 56, height: 56, flex: 'none', background: '#DCDBD5', borderRadius: 10, overflow: 'hidden' }}>
                {hero.image && <img src={hero.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{hero.name}</span>
                <span style={{ fontSize: 13, color: '#4A4D55' }}>{hero.hasRange ? 'dès ' : ''}{fmt(hero.price)}</span>
              </span>
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}

function SectionHead({ title, link, to }: { title: string; link: string; to: string }) {
  const L = useLayout();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 28 }}>
      <h2 className="display" style={{ fontSize: L.mobile ? 42 : 56, lineHeight: 0.95 }}>{title}</h2>
      <Link to={to} style={{ fontWeight: 600, fontSize: 15, textDecoration: 'underline', padding: '12px 0' }}>{link}</Link>
    </div>
  );
}

export default function Home() {
  const L = useLayout();
  const { products, hidden, imageFor } = useCatalog();
  const px = L.mobile ? '20px' : '24px';
  // Nouveautés : les articles publiés le plus récemment.
  const fresh = useMemo(
    () => [...products].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')).slice(0, 8),
    [products],
  );
  const sports = COLLECTIONS.filter((c) => !hidden(c.id));
  // Bandeau « Collection performance » : une photo d'article training, sinon la première disponible.
  const perfImg = imageFor('training') ?? products.find((p) => p.image)?.image;

  return (
    <>
      <Hero />

      {sports.length > 0 && (
        <section aria-label="Sports" style={{ ...wrap(px), paddingTop: L.mobile ? 56 : 80, paddingBottom: 40 }}>
          <SectionHead title="Choisis ton sport" link="Tout voir" to={shopPath('all')} />
          <div data-reveal style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.mobile ? 150 : 240}px, 1fr))`, gap: 16 }}>
            {sports.map((c) => {
              const img = imageFor(c.id as Parameters<typeof imageFor>[0]);
              return (
                <Link key={c.id} to={shopPath(c.id)} className="card" style={{ position: 'relative', height: L.mobile ? 240 : 380, background: '#DCDBD5', borderRadius: 16, display: 'flex', alignItems: 'flex-end', padding: L.mobile ? 14 : 20, overflow: 'hidden' }}>
                  {img
                    ? <img className="zoom-hover" src={img} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="#4A4D55" strokeWidth="1" strokeLinejoin="round" style={{ position: 'absolute', top: '22%', left: '50%', width: '38%', transform: 'translateX(-50%)' }}><path d={ICONS[c.id as keyof typeof ICONS] ?? ICONS.training} /></svg>}
                  <span style={{ position: 'relative', background: '#0D0E11', color: '#F2F1EC', fontFamily: 'var(--display-font)', fontWeight: 800, fontSize: L.mobile ? 20 : 26, padding: '8px 16px', borderRadius: 8, textTransform: 'uppercase' }}>{c.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section id="nouveautes" style={{ ...wrap(px), paddingTop: 40, paddingBottom: L.mobile ? 56 : 80 }}>
        <SectionHead title="Nouveautés" link="Voir les nouveautés" to={shopPath('new')} />
        <ProductGrid items={fresh} />
      </section>

      <section style={{ background: 'var(--accent)', color: '#0D0E11' }}>
        <div data-reveal style={{ ...wrap(px), paddingTop: L.mobile ? 48 : 72, paddingBottom: L.mobile ? 48 : 72, display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
          <div style={{ flex: '1 1 480px', minWidth: 0, minHeight: L.mobile ? 280 : 380, background: '#0D0E11', borderRadius: 20, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {perfImg
              ? <img src={perfImg} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Logo size={160} />}
          </div>
          <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: 3 }}>COLLECTION PERFORMANCE</p>
            <h2 className="display" style={{ fontSize: 'clamp(52px, 6vw, 84px)', lineHeight: 0.9 }}>Fait pour<br />transpirer.</h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, maxWidth: 460 }}>Tissus techniques à séchage rapide, coutures plates et coupes ajustées pour tes séances les plus intenses.</p>
            <div><Link className="btn btn-dark" to={shopPath('training')}>Découvrir la collection</Link></div>
          </div>
        </div>
      </section>

      <section aria-label="Nos engagements" style={{ ...wrap(px), paddingTop: 56, paddingBottom: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        {PILLARS.map((p, i) => (
          <div key={p.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D0E11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>{PILLAR_ICONS[i]}</svg>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{p.t}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--graphite)' }}>{p.d}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
