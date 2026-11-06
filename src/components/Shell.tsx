import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalog } from '../catalog';
import { fmt } from '../data';
import { useLayout } from '../layout';
import { PATHS, productPath, shopPath } from '../routes';
import { useStore } from '../store';
import { CloseIcon, MenuIcon, SearchIcon } from './icons';

const NAV: { label: string; to: string; match: (path: string) => boolean }[] = [
  { label: 'Femme', to: shopPath('femme'), match: (p) => p === shopPath('femme') },
  { label: 'Homme', to: shopPath('homme'), match: (p) => p === shopPath('homme') },
  { label: 'Lookbook', to: '/#lookbook', match: () => false },
  { label: 'Shop', to: shopPath('all'), match: (p) => p.startsWith('/produits') && p !== shopPath('femme') && p !== shopPath('homme') },
];

/** Symbole Vasyciao (infini et V), blanc sur fond sombre ; `light` ou `mono` : version noire pour fond clair. */
export function Logo({ size, light = false, mono }: { size: number; light?: boolean; mono?: string }) {
  const dark = light || !!mono;
  return <img src={dark ? '/mark-black.png' : '/mark-white.png'} alt="Vasyciao" width={Math.round(size * 1.4)} height={Math.round(size * 0.68)} style={{ flex: 'none', display: 'block', objectFit: 'contain' }} />;
}

/** Mot « VASYCIAO » en Anton. */
export function Wordmark({ size }: { size: number }) {
  return <span style={{ fontFamily: 'var(--display-font)', fontSize: size, lineHeight: 1, whiteSpace: 'nowrap' }}>VASYCIAO</span>;
}

/** Logo complet (symbole + nom), tel que dans la maquette. */
function Brand({ h }: { h: number }) {
  return (
    <Link to="/" aria-label="Vasyciao — accueil" style={{ display: 'block', flex: 'none' }}>
      <img src="/logo-white.png" alt="Vasyciao" height={h} width={Math.round(h * 600 / 396)} style={{ display: 'block' }} />
    </Link>
  );
}

export function TopBar() {
  return (
    <div className="light" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.08em', padding: '9px 16px', textAlign: 'center' }}>
      LIVRAISON PARTOUT AU MAROC  ✕  ÉCHANGE SOUS 7 JOURS  ✕  NOUVELLE COLLECTION 2026  ✕  PAIEMENT À LA LIVRAISON
    </div>
  );
}

const cartBtn: React.CSSProperties = { border: 0, background: '#F5F5F3', color: '#0B0B0B', fontFamily: 'var(--mono)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };

export function Header() {
  const L = useLayout();
  const { pathname } = useLocation();
  const { openSearch, openMenu, openDrawer, count, menu } = useStore();
  const wrap: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 40, background: '#0B0B0B', borderBottom: '1px solid #2A2A2A' };
  if (L.mobile) {
    return (
      <header style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 10px 0 20px', gap: 8 }}>
          <Brand h={44} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="icon-btn" onClick={openSearch} aria-label="Rechercher"><SearchIcon size={20} /></button>
            <button onClick={openDrawer} aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`} style={{ ...cartBtn, height: 40, padding: '0 12px', fontSize: 12 }}>({count})</button>
            <button className="icon-btn" onClick={openMenu} aria-label="Menu" aria-expanded={menu}><MenuIcon size={22} /></button>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header style={wrap}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Brand h={56} />
        <nav aria-label="Navigation principale" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className={`nav-link${n.match(pathname) ? ' on' : ''}`}>[ {n.label} ]</Link>
          ))}
          <span aria-hidden="true" style={{ width: 1, height: 24, background: '#2A2A2A', margin: '0 10px' }} />
          <button className="nav-link" onClick={openSearch} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '14px 10px' }}>Recherche</button>
          <Link className="nav-link" to={PATHS.account} style={{ padding: '14px 10px' }}>Compte</Link>
          <button onClick={openDrawer} style={{ ...cartBtn, height: 44, padding: '0 16px', fontSize: 13 }}>PANIER ({count})</button>
        </nav>
      </div>
    </header>
  );
}

const FOOTER = [
  { t: 'BOUTIQUE', links: [['Femme', shopPath('femme')], ['Homme', shopPath('homme')], ['Nouveautés', shopPath('new')], ['Shop', shopPath('all')]] },
  { t: 'AIDE', links: [['Livraison & retours', PATHS.faq], ['Guide des tailles', PATHS.faq], ['Contact', PATHS.contact], ['Mon compte', PATHS.account]] },
  { t: 'INFOS', links: [['À propos', PATHS.about], ['Conditions générales', PATHS.cgv], ['Confidentialité', PATHS.privacy], ['Administration', PATHS.admin]] },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return (
    <>
      <section aria-label="Newsletter" className="light">
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '64px 24px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h2 className="display" style={{ flex: '1 1 420px', minWidth: 0, fontSize: 'clamp(44px, 5vw, 80px)', lineHeight: 0.95 }}>Les nouveautés<br />en premier</h2>
          {subscribed ? (
            <p style={{ flex: '1 1 420px', margin: 0, fontFamily: 'var(--mono)', fontSize: 14 }}>C’EST NOTÉ. TU RECEVRAS LES PROCHAINES PIÈCES AVANT TOUT LE MONDE.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setSubscribed(true); }} style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label htmlFor="vc-email" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>TON E-MAIL</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '2px solid #0B0B0B' }}>
                <input id="vc-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com"
                  style={{ flex: '1 1 200px', minWidth: 0, height: 56, border: 0, background: 'transparent', color: '#0B0B0B', fontSize: 20, padding: 0, outline: 'none' }} />
                <button type="submit" style={{ height: 56, padding: '0 4px', background: 'transparent', border: 0, color: '#0B0B0B', fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>S’INSCRIRE →</button>
              </div>
            </form>
          )}
        </div>
      </section>
      <footer style={{ background: '#0B0B0B', containerType: 'inline-size' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '48px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 28, fontFamily: 'var(--mono)', fontSize: 13 }}>
          {FOOTER.map((g) => (
            <nav key={g.t} aria-label={g.t} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: '#8C8C8C' }}>{g.t}</span>
              {g.links.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
            </nav>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ color: '#8C8C8C' }}>©</span>
            <span>2026 Vasyciao</span>
            <span>Tous droits réservés</span>
            <span style={{ color: '#8C8C8C' }}>Paiement à la livraison · Virement</span>
          </div>
        </div>
        <p aria-hidden="true" style={{ margin: '24px 0 0', padding: '0 12px', fontFamily: 'var(--display-font)', fontSize: '22.5cqw', lineHeight: 0.8, textAlign: 'center', color: '#F5F5F3', overflow: 'hidden', whiteSpace: 'nowrap' }}>VASYCIAO</p>
      </footer>
    </>
  );
}

function QtyStepper({ qty, onDec, onInc, h = 36 }: { qty: number; onDec: () => void; onInc: () => void; h?: number }) {
  const b: React.CSSProperties = { width: h - 2, height: h - 2, border: 0, background: 'none', cursor: 'pointer', fontSize: 16 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: h, border: '1px solid var(--line-strong)', background: 'transparent' }}>
      <button style={b} onClick={onDec} aria-label="Diminuer la quantité">−</button>
      <span style={{ minWidth: 16, textAlign: 'center', fontSize: 13.5 }}>{qty}</span>
      <button style={b} onClick={onInc} aria-label="Augmenter la quantité">+</button>
    </div>
  );
}
export { QtyStepper };

export function Overlays() {
  const L = useLayout();
  const navigate = useNavigate();
  const s = useStore();
  const anyOverlay = s.drawer || s.search;

  // Recherche
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (s.search) setTimeout(() => searchRef.current?.focus(), 250); }, [s.search]);
  const { products } = useCatalog();
  const query = q.trim().toLowerCase();
  const results = useMemo(
    () => (query
      ? products.filter((p) => `${p.name} ${p.col} ${p.kind} ${p.sku} ${p.swatches.map((x) => x.label).join(' ')}`.toLowerCase().includes(query))
      : products.slice(0, 4)),
    [query, products],
  );

  const go = (to: string) => { s.closeAll(); navigate(to); };

  return (
    <>
      <div
        onClick={s.closeAll}
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.6)', opacity: anyOverlay ? 1 : 0, pointerEvents: anyOverlay ? 'auto' : 'none', transition: 'opacity .5s ease' }}
      />

      {/* Panier latéral */}
      <aside
        aria-label="Panier" aria-hidden={!s.drawer}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 70, width: 'min(440px,100vw)', background: 'var(--ivory)', display: 'flex', flexDirection: 'column', transform: s.drawer ? 'translateX(0)' : 'translateX(105%)', transition: 'transform .6s var(--ease)', boxShadow: '-20px 0 60px rgba(0,0,0,.5)', borderLeft: '1px solid var(--line)', visibility: s.drawer ? 'visible' : 'hidden', transitionProperty: 'transform, visibility' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <span className="display" style={{ fontSize: 32 }}>Panier ({s.count})</span>
          <button className="icon-btn" onClick={s.closeAll} aria-label="Fermer"><CloseIcon /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {s.count === 0 && <p style={{ margin: '32px 0', fontSize: 15, color: 'var(--muted)' }}>Votre panier est vide.</p>}
          {s.items.map((l) => {
            const p = l.product;
            return (
              <div key={l.key} style={{ display: 'grid', gridTemplateColumns: '76px minmax(0,1fr)', gap: 16, padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
                <button className="ph" onClick={() => go(productPath(p.id))} aria-label={p.name} style={{ aspectRatio: '1', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {l.image
                    ? <img src={l.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ width: '52%', aspectRatio: '1', borderRadius: '50%', border: '1px solid #3A3A3A' }} />}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, textTransform: 'uppercase' }}>{p.name}</span>
                      {l.label && <span style={{ fontSize: 12.5, color: 'var(--graphite)' }}>{l.label}</span>}
                    </span>
                    <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{fmt(l.unit * l.qty)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <QtyStepper qty={l.qty} onDec={() => s.setQty(l.key, -1)} onInc={() => s.setQty(l.key, 1)} />
                    <button onClick={() => s.remove(l.key)} style={{ background: 'none', border: 0, borderBottom: '1px solid var(--faint)', padding: '1px 0', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}>Retirer</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '20px 24px 24px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--paper)' }}>
          {s.qtyDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>{s.qtyLabel}</span><span>−{fmt(s.qtyDiscount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14 }}>{s.qtyDiscount > 0 ? 'Total' : 'Sous-total'} · livraison incluse</span>
            <span style={{ fontStretch: '110%', fontSize: 20, fontWeight: 500 }}>{fmt(s.subtotal - s.qtyDiscount)}</span>
          </div>
          {s.nextTier && <span style={{ fontSize: 13, padding: '10px 12px', background: '#F5F5F3', color: '#0B0B0B', lineHeight: 1.4 }}>Ajoutez {s.nextTier.missing} {s.nextTier.productName ?? `article${s.nextTier.missing > 1 ? 's' : ''}`} et économisez <strong>{fmt(s.nextTier.amount)}</strong> sur votre commande.</span>}
          <button className="btn btn-primary" disabled={s.count === 0} onClick={() => go(PATHS.checkout)} style={{ opacity: s.count === 0 ? 0.4 : 1 }}>Commander</button>
          <button className="btn btn-outline" style={{ height: 50 }} onClick={() => go(PATHS.cart)}>Voir le panier</button>
        </div>
      </aside>

      {/* Menu mobile */}
      <div
        aria-hidden={!s.menu}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: '#0B0B0B', color: '#F5F5F3', display: 'flex', flexDirection: 'column', padding: '10px 20px 32px', opacity: s.menu ? 1 : 0, pointerEvents: s.menu ? 'auto' : 'none', transition: 'opacity .35s ease', visibility: s.menu ? 'visible' : 'hidden', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 44, borderBottom: '1px solid #2A2A2A', paddingBottom: 10 }}>
          <img src="/logo-white.png" alt="Vasyciao" height={40} width={61} />
          <button className="icon-btn" onClick={s.closeAll} aria-label="Fermer le menu" style={{ background: 'transparent', marginRight: -10 }}><CloseIcon color="#F5F5F3" size={20} /></button>
        </div>
        <nav aria-label="Menu mobile" style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {[...NAV, { label: 'Nouveautés', to: shopPath('new') }].map((n) => (
            <button key={n.label} onClick={() => go(n.to)} style={{ display: 'block', padding: '6px 0', background: 'none', border: 0, borderBottom: '1px solid #2A2A2A', color: '#F5F5F3', cursor: 'pointer', fontFamily: 'var(--display-font)', textTransform: 'uppercase', fontSize: 44, lineHeight: 1.1, textAlign: 'left' }}>
              {n.label}
            </button>
          ))}
          <button onClick={() => go(PATHS.account)} style={{ textAlign: 'left', background: 'none', border: 0, color: '#F5F5F3', fontFamily: 'var(--mono)', fontSize: 13, padding: '16px 0 0', cursor: 'pointer' }}>MON COMPTE →</button>
        </nav>
        <button className="btn btn-light" style={{ marginTop: 'auto', height: 52 }} onClick={() => go(PATHS.cart)}>PANIER ({s.count})</button>
      </div>

      {/* Recherche */}
      <div
        role="search" aria-hidden={!s.search}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 75, background: 'var(--ivory)', borderBottom: '1px solid var(--line)', padding: `20px ${L.px} 28px`, transform: s.search ? 'translateY(0)' : 'translateY(-105%)', transition: 'transform .55s var(--ease)', visibility: s.search ? 'visible' : 'hidden', transitionProperty: 'transform, visibility' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--ink)', paddingBottom: 10 }}>
          <SearchIcon size={22} />
          <input
            ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(productPath(results[0].id)); }}
            placeholder="Rechercher une veste, un pull, une robe…" aria-label="Rechercher"
            style={{ flex: 1, minWidth: 0, height: 48, border: 0, background: 'transparent', fontSize: L.searchFs, fontStretch: '110%', outline: 'none', color: 'var(--ink)' }}
          />
          <button className="icon-btn" onClick={s.closeAll} aria-label="Fermer"><CloseIcon /></button>
        </div>
        <span className="mono" style={{ display: 'block', marginTop: 18, fontSize: 10.5, letterSpacing: '.14em' }}>
          {query ? `${results.length} résultat${results.length > 1 ? 's' : ''}` : 'Les plus recherchés'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {results.map((p) => (
            <button
              key={p.id} onClick={() => go(productPath(p.id))}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 0', background: 'none', border: 0, borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left', transition: 'padding .3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = '8px')}
              onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = '0')}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>{p.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--graphite)' }}>{p.kind}</span>
              </span>
              <span style={{ fontSize: 14 }}>{p.hasRange ? 'dès ' : ''}{fmt(p.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
