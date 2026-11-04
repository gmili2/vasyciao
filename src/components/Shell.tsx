import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalog } from '../catalog';
import { fmt } from '../data';
import { useLayout } from '../layout';
import { PATHS, productPath, shopPath } from '../routes';
import { useStore } from '../store';
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './icons';

const NAV: { label: string; to: string; match: (path: string) => boolean; sale?: boolean }[] = [
  { label: 'Femme', to: shopPath('femme'), match: (p) => p === shopPath('femme') },
  { label: 'Homme', to: shopPath('homme'), match: (p) => p === shopPath('homme') },
  { label: 'Nouveautés', to: shopPath('new'), match: (p) => p === shopPath('new') },
  { label: 'Soldes', to: shopPath('promo'), match: (p) => p === shopPath('promo'), sale: true },
];

/** Symbole Vasyciao (infini et V), noir sur fond clair ; `light={false}` sans `mono` sur fond sombre : version blanche. */
export function Logo({ size, light = true, mono }: { size: number; light?: boolean; mono?: string }) {
  const dark = light || !!mono;
  return <img src={dark ? '/mark-black.png' : '/mark-white.png'} alt="Vasyciao" width={Math.round(size * 1.4)} height={Math.round(size * 0.68)} style={{ flex: 'none', display: 'block', objectFit: 'contain' }} />;
}

/** Mot « VASYCIAO » en Archivo élargi. */
export function Wordmark({ size }: { size: number }) {
  return <span style={{ fontFamily: 'var(--display-font)', fontStretch: '112%', fontWeight: 800, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap' }}>VASYCIAO</span>;
}

/** Logo complet (symbole + nom), centré dans l'en-tête comme dans la maquette. */
function Brand({ h, white = false }: { h: number; white?: boolean }) {
  return (
    <Link to="/" aria-label="Vasyciao — accueil" style={{ display: 'block', flex: 'none' }}>
      <img src={white ? '/logo-white.png' : '/logo-black.png'} alt="Vasyciao" height={h} width={Math.round(h * 600 / 396)} style={{ display: 'block' }} />
    </Link>
  );
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase' };

export function TopBar() {
  const L = useLayout();
  return (
    <div className="dark" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.16em' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '9px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: L.mobile ? 'center' : 'space-between', gap: 8, textAlign: 'center' }}>
        <span>LIVRAISON OFFERTE PARTOUT AU MAROC · ÉCHANGE SOUS 7 JOURS</span>
        {L.desktop && <span style={{ display: 'flex', gap: 20 }}><Link to={PATHS.account}>SUIVRE MA COMMANDE</Link><Link to={PATHS.faq}>AIDE</Link></span>}
      </div>
    </div>
  );
}

function CartButton() {
  const { count, openDrawer } = useStore();
  return (
    <button className="icon-btn" onClick={openDrawer} aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
      <BagIcon size={20} />
      {count > 0 && <span className="badge-count">{count}</span>}
    </button>
  );
}

export function Header() {
  const L = useLayout();
  const { pathname } = useLocation();
  const { openSearch, openMenu, favs, menu } = useStore();
  const wrap: React.CSSProperties = { position: 'sticky', top: 0, zIndex: 40, background: 'var(--ivory)', borderBottom: '1px solid var(--line)' };
  const side: React.CSSProperties = { flex: '1 1 0', display: 'flex', minWidth: 0 };
  return (
    <header style={wrap}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: L.mobile ? '6px 14px' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {L.mobile ? (
          <div style={side}><button className="icon-btn" onClick={openMenu} aria-label="Menu" aria-expanded={menu} style={{ marginLeft: -6 }}><MenuIcon size={22} /></button></div>
        ) : (
          <nav aria-label="Navigation principale" style={{ ...side, flexWrap: 'wrap', gap: 4 }}>
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} className={`nav-link${n.match(pathname) ? ' on' : ''}`} style={n.sale ? { color: 'var(--sale)' } : undefined}>{n.label}</Link>
            ))}
          </nav>
        )}
        <Brand h={L.mobile ? 52 : 76} />
        <div style={{ ...side, justifyContent: 'flex-end', gap: 2 }}>
          {L.desktop && (
            <>
              <button className="icon-btn" onClick={openSearch} aria-label="Rechercher"><SearchIcon size={20} /></button>
              <Link className="icon-btn" to={PATHS.account} aria-label="Mon compte"><UserIcon size={20} /></Link>
              <Link className="icon-btn" to={PATHS.favorites} aria-label={`Favoris, ${favs.length}`}><HeartIcon size={20} />{favs.length > 0 && <span className="badge-count">{favs.length}</span>}</Link>
            </>
          )}
          {L.mobile && <button className="icon-btn" onClick={openSearch} aria-label="Rechercher"><SearchIcon size={20} /></button>}
          <CartButton />
        </div>
      </div>
    </header>
  );
}

const FOOTER = [
  { t: 'BOUTIQUE', links: [['Femme', shopPath('femme')], ['Homme', shopPath('homme')], ['Nouveautés', shopPath('new')], ['Soldes', shopPath('promo')]] },
  { t: 'AIDE', links: [['Livraison & retours', PATHS.faq], ['Guide des tailles', PATHS.faq], ['Contact', PATHS.contact], ['Suivre ma commande', PATHS.account]] },
  { t: 'INFOS', links: [['À propos', PATHS.about], ['Conditions générales', PATHS.cgv], ['Confidentialité', PATHS.privacy], ['Administration', PATHS.admin]] },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  return (
    <>
      <section aria-label="Newsletter" className="dark">
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '72px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 28 }}>
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="eyebrow">Newsletter</p>
            <h2 className="display" style={{ fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.05 }}>Les nouveautés en avant-première</h2>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--muted)' }}>{subscribed ? 'C’est noté : vous recevrez nos prochaines nouveautés avant tout le monde.' : 'Les nouvelles pièces et les offres réservées aux abonnés, une fois par semaine.'}</p>
          </div>
          {!subscribed && (
            <form onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setSubscribed(true); }} style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexWrap: 'wrap' }}>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre e-mail" aria-label="Adresse e-mail"
                style={{ flex: '1 1 220px', minWidth: 0, height: 54, padding: '0 18px', border: '1px solid #F2F2F0', background: 'transparent', color: '#F2F2F0', fontSize: 15, outline: 'none' }}
              />
              <button type="submit" style={{ ...label, flex: 'none', height: 54, padding: '0 28px', border: '1px solid #F2F2F0', background: '#F2F2F0', color: '#111111', cursor: 'pointer' }}>S’inscrire</button>
            </form>
          )}
        </div>
      </section>
      <footer>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '56px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <img src="/logo-black.png" alt="Vasyciao" width={136} height={90} style={{ display: 'block' }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--graphite)' }}>La mode qui avance avec vous.</p>
          </div>
          {FOOTER.map((g) => (
            <nav key={g.t} aria-label={g.t} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '.2em' }}>{g.t}</h3>
              {g.links.map(([l, to]) => <Link key={l} to={to} style={{ fontSize: 14 }}>{l}</Link>)}
            </nav>
          ))}
        </div>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px', borderTop: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, fontSize: 12, color: 'var(--graphite)' }}>
          <span>© 2026 Vasyciao. Tous droits réservés.</span>
          <span>Paiement à la livraison · Virement bancaire</span>
        </div>
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
          <span className="display" style={{ fontSize: 24 }}>Panier ({s.count})</span>
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
                    : <span style={{ width: '52%', aspectRatio: '1', borderRadius: '50%', border: '1px solid var(--line)' }} />}
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
          {s.nextTier && <span style={{ fontSize: 13, padding: '10px 12px', background: '#111111', color: '#FFFFFF', lineHeight: 1.4 }}>Ajoutez {s.nextTier.missing} {s.nextTier.productName ?? `article${s.nextTier.missing > 1 ? 's' : ''}`} et économisez <strong>{fmt(s.nextTier.amount)}</strong> sur votre commande.</span>}
          <button className="btn btn-primary" disabled={s.count === 0} onClick={() => go(PATHS.checkout)} style={{ opacity: s.count === 0 ? 0.4 : 1 }}>Commander</button>
          <button className="btn btn-outline" style={{ height: 50 }} onClick={() => go(PATHS.cart)}>Voir le panier</button>
        </div>
      </aside>

      {/* Menu mobile */}
      <div
        aria-hidden={!s.menu}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--ivory)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', padding: '6px 24px 28px', opacity: s.menu ? 1 : 0, pointerEvents: s.menu ? 'auto' : 'none', transition: 'opacity .35s ease', visibility: s.menu ? 'visible' : 'hidden', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
          <button className="icon-btn" onClick={s.closeAll} aria-label="Fermer le menu" style={{ marginLeft: -10 }}><CloseIcon size={20} /></button>
          <img src="/logo-black.png" alt="Vasyciao" height={52} width={79} />
          <span style={{ width: 44 }} />
        </div>
        <nav aria-label="Menu mobile" style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV.map((n) => (
            <button key={n.label} onClick={() => go(n.to)} style={{ padding: '14px 0', background: 'none', border: 0, borderBottom: '1px solid var(--line)', color: n.sale ? 'var(--sale)' : 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--display-font)', fontStretch: '112%', fontWeight: 600, fontSize: 26, textAlign: 'left' }}>
              {n.label}
            </button>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', paddingTop: 12 }}>
            {([['Rechercher', s.openSearch], ['Mon compte', () => go(PATHS.account)], [`Favoris (${s.favs.length})`, () => go(PATHS.favorites)]] as [string, () => void][]).map(([l, f]) => (
              <button key={l} onClick={f} style={{ background: 'none', border: 0, color: 'var(--ink)', fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', padding: '12px 0', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
        </nav>
        <button className="btn btn-primary" style={{ marginTop: 'auto', height: 52 }} onClick={() => go(PATHS.cart)}>Panier ({s.count})</button>
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
