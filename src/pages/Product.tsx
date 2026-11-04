import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useCatalog } from '../catalog';
import { Crumbs, Dial, ProductGrid, iconOf } from '../components/Catalog';
import { QtyStepper } from '../components/Shell';
import { BagIcon, HeartIcon } from '../components/icons';
import { fmt, ratingF, stars, type Product as P, type Variant } from '../data';
import { useLayout } from '../layout';
import { track } from '../pixel';
import { PATHS, productPath, shopPath } from '../routes';
import { SHOP_PITCH, setMeta } from '../seo';
import { lineKey, useStore } from '../store';

type Review = { id: string; author: string; rating: number; title: string | null; comment: string; createdAt: string };
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' });
const pct = (price: number, old: number) => '−' + Math.round((1 - price / old) * 100) + ' %';

/** Valeurs choisies par défaut : la première déclinaison disponible. */
function defaultSelection(p: P): Record<string, string> {
  const v = p.variants.find((x) => x.inStock) ?? p.variants[0];
  return v ? Object.fromEntries((p.options ?? []).map((o, i) => [o.name, v.values[i]?.label ?? o.values[0].label])) : {};
}
const matches = (p: P, v: Variant, sel: Record<string, string>) => (p.options ?? []).every((o, i) => v.values[i]?.label === sel[o.name]);

export default function Product() {
  const L = useLayout();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const catalog = useCatalog();
  const p = catalog.find(id);
  const { add, cart, remove, favs, toggleFav } = useStore();
  // Photo affichée : index choisi à la main, ou -1 = suivre la photo de la couleur sélectionnée.
  const [img, setImg] = useState(-1);
  const [tab, setTab] = useState(0);
  const [qty, setQty] = useState(1);
  // Offre choisie (1, 2, 3 articles…) et coloris des articles 2, 3… (l’article 1 suit la sélection principale).
  // ?offre=2 dans le lien (publicités) : l'offre de 2 articles est présélectionnée.
  const [params] = useSearchParams();
  const [packWanted, setPack] = useState(() => Number(params.get('offre')) || 1);
  const [extra, setExtra] = useState<string[]>([]);
  // Choix d'options, mémorisé par article : changer de fiche repart des valeurs par défaut.
  const [choice, setChoice] = useState<{ id: string; sel: Record<string, string> }>({ id: '', sel: {} });
  const [reviews, setReviews] = useState<{ id: string; list: Review[] }>({ id: '', list: [] });

  useEffect(() => { setImg(-1); setTab(0); setQty(1); setPack(Number(params.get('offre')) || 1); setExtra([]); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!p) return;
    const text = `${p.kind ? p.kind + '. ' : ''}${p.desc}`.replace(/\s+/g, ' ');
    setMeta({
      title: `${p.name} — ${fmt(p.price)} — VASYCIAO`,
      description: `${p.name} à ${fmt(p.price)}${p.hasRange ? ' et plus' : ''}. ${text} ${SHOP_PITCH}`.slice(0, 300),
      path: productPath(p.id),
    });
  }, [p]);
  useEffect(() => {
    if (p) track('ViewContent', { content_ids: [p.id], content_name: p.name, content_type: 'product', value: p.price, currency: 'MAD' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);
  useEffect(() => {
    let live = true;
    api<{ data: { reviews: Review[] } }>(`/products/${encodeURIComponent(id)}`)
      .then((r) => { if (live) setReviews({ id, list: r.data.reviews }); })
      .catch(() => { if (live) setReviews({ id, list: [] }); });
    return () => { live = false; };
  }, [id]);

  if (!p) {
    if (catalog.status === 'ready') return <Navigate to={shopPath('all')} replace />;
    return (
      <section style={{ padding: `${L.pageTop} ${L.px} 0`, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        {catalog.status === 'error' ? (
          <>
            <p style={{ margin: 0, fontSize: 16, color: 'var(--muted)' }}>Cet article est momentanément indisponible.</p>
            <button className="btn btn-outline" onClick={catalog.reload} style={{ height: 48, padding: '0 24px' }}>Réessayer</button>
          </>
        ) : <div className="ph" aria-busy="true" style={{ width: '100%', maxWidth: 620, aspectRatio: '1', opacity: 0.6 }} />}
      </section>
    );
  }

  const sel = choice.id === p.id ? choice.sel : defaultSelection(p);
  const choose = (name: string, label: string) => {
    let next = { ...sel, [name]: label };
    // Si la combinaison n'existe pas, on bascule sur la première déclinaison qui porte cette valeur.
    if (!p.variants.some((v) => matches(p, v, next))) {
      const i = (p.options ?? []).findIndex((o) => o.name === name);
      const alt = p.variants.find((v) => v.values[i]?.label === label && v.inStock) ?? p.variants.find((v) => v.values[i]?.label === label);
      if (alt) next = Object.fromEntries((p.options ?? []).map((o, k) => [o.name, alt.values[k].label]));
    }
    setChoice({ id: p.id, sel: next });
    setImg(-1); // la première photo suit la nouvelle couleur
  };
  const variant = p.variants.find((v) => matches(p, v, sel));
  /** Une valeur est disponible si, combinée aux autres choix actuels, elle donne une déclinaison en stock. */
  const available = (name: string, label: string) => p.variants.some((v) => v.inStock && matches(p, v, { ...sel, [name]: label }));
  const price = variant?.price ?? p.price;
  const old = variant ? variant.old : p.old;
  const canBuy = p.purchasable && (p.variants.length ? !!variant?.inStock : p.inStock);
  const stockText = !p.purchasable ? 'Pièce présentée en vitrine' : !p.variants.length ? p.stock : !variant ? 'Combinaison indisponible' : !variant.inStock ? 'Épuisé dans cette version' : variant.lowStock ? 'Dernières pièces disponibles' : 'En stock — expédié sous 24 h';
  const photos = p.photos.length ? p.photos : p.image ? [p.image] : [];
  // Galerie : les photos puis les vidéos ; `img` désigne un élément de cette suite.
  const gallery = [...photos.map((src) => ({ src, video: false })), ...p.videos.map((src) => ({ src, video: true }))];
  const variantPhoto = variant?.imageUrl ? photos.indexOf(variant.imageUrl) : -1;
  const shown = img >= 0 ? Math.min(img, gallery.length - 1) : Math.max(0, variantPhoto);
  const mainPhoto = variant?.imageUrl && img < 0 && variantPhoto < 0 ? variant.imageUrl : photos[shown];
  const ref = variant?.sku ?? p.sku;
  const buy = () => { if (canBuy) addPack(); };
  /* ---------- offres par quantité (« 2 pour 229 DH ») ---------- */
  // Paliers de ce modèle, sinon paliers généraux (même règle que le serveur, article seul dans le panier).
  const tiers = p.qtyTiers.length ? p.qtyTiers : catalog.qtyTiers;
  const offers = p.purchasable && tiers.length ? [...new Set([1, ...tiers.map((t) => t.minQty)])].sort((a, b) => a - b).slice(0, 5) : [];
  const pack = offers.includes(packWanted) ? packWanted : 1;
  const inStockVariants = p.variants.filter((v) => v.inStock);
  const unitVariants = (n: number) => Array.from({ length: n }, (_, i) => (i === 0 ? variant : p.variants.find((v) => v.id === extra[i - 1]) ?? variant));
  const packPrice = (n: number) => {
    const sum = unitVariants(n).reduce((a, v) => a + (v?.price ?? p.price), 0);
    const t = tiers.filter((x) => x.minQty <= n).sort((a, b) => b.minQty - a.minQty)[0];
    return { sum, total: sum - (t ? Math.min(t.amount, sum) : 0) };
  };
  const units = offers.length ? pack : qty;
  const { sum: packSum, total: packTotal } = offers.length ? packPrice(pack) : { sum: price * qty, total: price * qty };
  /** Ajoute l'offre au panier : une ligne par coloris (« Full black × 2 »). */
  const addPack = () => {
    if (!offers.length) return add(p.id, qty, variant?.id);
    const counts = new Map<string | undefined, number>();
    for (const v of unitVariants(pack)) counts.set(v?.id, (counts.get(v?.id) ?? 0) + 1);
    for (const [vid, n] of counts) add(p.id, n, vid, true);
    // Pixel Meta : un seul ajout au panier pour le lot, à son prix réel (remise comprise).
    track('AddToCart', { content_ids: [p.id], content_name: p.name, content_type: 'product', num_items: pack, value: packTotal, currency: 'MAD' });
  };
  /** Achat direct (publicités) : le panier reçoit exactement l'offre choisie pour cet article, puis le formulaire de commande. */
  const buyNow = () => {
    if (!canBuy) return;
    for (const l of cart.filter((x) => x.id === p.id)) remove(lineKey(l.id, l.variantId));
    addPack();
    navigate(PATHS.checkout);
  };

  const similar = catalog.products.filter((x) => x.id !== p.id && x.cats.some((c) => p.cats.includes(c) && c !== 'new')).slice(0, 4);
  const tabs: [string, string][] = [
    ['Matière & entretien', [p.movement, p.glass].filter(Boolean).join(' · ')],
    ['Taille & coupe', [p.strap, p.dims && `Tailles : ${p.dims}`].filter(Boolean).join(' · ')],
    ['Livraison & retours', 'Livraison en 2 à 4 jours partout au Maroc, paiement à la livraison. Échange de taille sous 7 jours, article non porté.'],
    ['Détails', [p.water, `Référence ${ref}`].filter(Boolean).join(' · ')],
  ].filter(([, v]) => v) as [string, string][];
  const fav = favs.includes(p.id);
  const who = p.cats.includes('femme') && p.cats.includes('homme') ? 'Mixte' : p.cats.includes('femme') ? 'Femme' : p.cats.includes('homme') ? 'Homme' : '';
  // Grille de photos : celle de la couleur choisie d'abord ; une seule photo → photo + gros plan, comme la maquette.
  const order = gallery.length ? [shown, ...gallery.map((_, i) => i).filter((i) => i !== shown)] : [];
  const tiles = order.map((i) => ({ ...gallery[i], src: i === shown && !gallery[i].video && mainPhoto ? mainPhoto : gallery[i].src, i, detail: false }));
  if (tiles.length === 1 && !tiles[0].video) tiles.push({ ...tiles[0], i: tiles[0].i, detail: true });
  const shownReviews = reviews.id === p.id ? reviews.list : [];
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink)' };

  return (
    <>
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '20px 24px 0' }}>
        <Crumbs items={[['Accueil', '/'], ...(who && who !== 'Mixte' ? [[who, shopPath(who === 'Femme' ? 'femme' : 'homme')] as [string, string]] : [['Boutique', shopPath('all')] as [string, string]]), [p.name]]} />
        <div style={{ display: 'grid', gridTemplateColumns: L.mobile ? 'minmax(0,1fr)' : 'minmax(0,1.45fr) minmax(340px,1fr)', gap: 48, marginTop: 20, alignItems: 'start' }}>
          <div data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {!tiles.length && (
              <div className="ph" style={{ gridColumn: '1 / -1', aspectRatio: '3 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dial size="30%" path={iconOf(p)} /></div>
            )}
            {tiles.map((t, k) => (
              <div key={`${t.src}-${k}`} style={{ position: 'relative', aspectRatio: '3 / 4', background: 'var(--stone)', overflow: 'hidden' }}>
                {t.video
                  ? <video src={t.src} controls muted loop playsInline preload="metadata" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
                  : <img src={t.src} alt={t.detail ? `${p.name}, détail` : p.name} loading={k > 1 ? 'lazy' : undefined}
                      onClick={() => !t.detail && setImg(t.i)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: t.detail ? 'center 62%' : 'center top', transform: t.detail ? 'scale(1.6)' : 'none', display: 'block' }} />}
              </div>
            ))}
          </div>

          <div data-reveal style={{ position: L.sticky, top: 110, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '.24em', color: 'var(--graphite)', textTransform: 'uppercase' }}>{[p.cats.includes('new') && 'Nouveau', who].filter(Boolean).join(' · ') || p.col}</p>
              <h1 className="display" style={{ fontSize: L.mobile ? 36 : 44, textTransform: 'uppercase' }}>{p.name}</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: old ? 'var(--sale)' : undefined }}>{fmt(price)}</span>
                {old && <><span style={{ fontSize: 15, color: 'var(--graphite)', textDecoration: 'line-through' }}>{fmt(old)}</span><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', color: 'var(--sale)' }}>{pct(price, old)}</span></>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--graphite)' }}>
                <span style={{ letterSpacing: '.12em', color: 'var(--ink)' }}>{stars(p.rating)}</span><span>{ratingF(p.rating)} · {p.reviews} avis</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span style={{ width: 7, height: 7, background: canBuy ? 'var(--ink)' : 'var(--faint)', boxShadow: '0 0 0 4px var(--line)' }} />{stockText}
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--body)', textWrap: 'pretty' }}>{p.desc}</p>
            {(p.options ?? []).map((o) => {
              const isColor = o.values.some((v) => v.colorHex);
              return (
                <div key={o.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, ...label }}>
                    <span>{o.name}{isColor && <span style={{ color: 'var(--graphite)' }}> · {sel[o.name]}</span>}</span>
                    {/taille|pointure/i.test(o.name) && <Link to={PATHS.faq} style={{ letterSpacing: '.1em' }}>Guide des tailles</Link>}
                  </div>
                  <div role="radiogroup" aria-label={o.name} style={isColor ? { display: 'flex', flexWrap: 'wrap', gap: 12 } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 6 }}>
                    {o.values.map((v) => {
                      const on = sel[o.name] === v.label;
                      const ok = available(o.name, v.label);
                      const title = v.label + (ok ? '' : ' — épuisé');
                      return isColor ? (
                        <button key={v.label} role="radio" aria-checked={on} aria-label={title} title={title} onClick={() => choose(o.name, v.label)}
                          style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', padding: 0, cursor: 'pointer', background: v.colorHex ?? 'var(--paper)', border: '2px solid var(--paper)', outline: on ? '1.5px solid var(--ink)' : '1.5px solid transparent', outlineOffset: 1, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)', opacity: ok ? 1 : 0.45, transition: 'box-shadow .25s' }}>
                          {!ok && <span aria-hidden style={{ position: 'absolute', left: '50%', top: 4, bottom: 4, width: 1, background: 'var(--ink)', transform: 'rotate(45deg)' }} />}
                        </button>
                      ) : (
                        <button key={v.label} role="radio" aria-checked={on} title={title} onClick={() => choose(o.name, v.label)}
                          style={{ height: 48, border: '1px solid var(--ink)', background: on ? 'var(--ink)' : 'transparent', color: on ? '#FFFFFF' : 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', ...(!ok && !on && { color: 'var(--faint)', borderColor: 'var(--line)', textDecoration: 'line-through' }) }}>{v.label}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {offers.length > 0 && canBuy && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={label}>Choisissez votre offre</span>
                <div role="radiogroup" aria-label="Offre" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {offers.map((n) => {
                    const { sum, total } = packPrice(n);
                    const on = pack === n;
                    return (
                      <button key={n} role="radio" aria-checked={on} onClick={() => setPack(n)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', background: on ? 'var(--paper)' : 'transparent', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line-strong)'}`, transition: 'border-color .2s' }}>
                        <span aria-hidden style={{ width: 18, height: 18, flex: 'none', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line-strong)'}`, boxShadow: on ? 'inset 0 0 0 4px var(--paper)' : 'none', background: on ? 'var(--ink)' : 'transparent' }} />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{n === 1 ? '1 article' : `${n} articles`}</span>
                          {total < sum && <span style={{ fontSize: 12.5, color: 'var(--graphite)' }}>Économisez {fmt(sum - total)}</span>}
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{fmt(total)}</span>
                          {total < sum && <span style={{ fontSize: 12.5, color: 'var(--graphite)', textDecoration: 'line-through' }}>{fmt(sum)}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {pack > 1 && p.variants.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
                    <span style={label}>Choix de chaque article</span>
                    {unitVariants(pack).map((uv, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, minWidth: 74 }}>Article {i + 1}</span>
                        {i === 0 ? (
                          <span style={{ fontSize: 13.5, color: 'var(--graphite)' }}>{uv?.values.map((x) => x.label).join(' · ')} <span style={{ fontSize: 12 }}>(choisie ci-dessus)</span></span>
                        ) : (
                          <span role="radiogroup" aria-label={`Choix de l’article ${i + 1}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {inStockVariants.map((v) => {
                              const on = uv?.id === v.id;
                              const hex = v.values.find((x) => x.colorHex)?.colorHex;
                              const name = v.values.map((x) => x.label).join(' · ');
                              const pick = () => setExtra((xs) => { const next = [...xs]; next[i - 1] = v.id; return next; });
                              return hex ? (
                                <button key={v.id} role="radio" aria-checked={on} aria-label={name} title={name} onClick={pick}
                                  style={{ width: 32, height: 32, borderRadius: '50%', padding: 0, cursor: 'pointer', background: hex, border: '2px solid var(--paper)', outline: on ? '1.5px solid var(--ink)' : '1.5px solid transparent', outlineOffset: 1 }} />
                              ) : (
                                <button key={v.id} role="radio" aria-checked={on} className={`chip${on ? ' active' : ''}`} onClick={pick} style={{ height: 36, padding: '0 14px', fontSize: 12.5 }}>{name}</button>
                              );
                            })}
                          </span>
                        )}
                        {i > 0 && <span style={{ fontSize: 12.5, color: 'var(--graphite)' }}>{uv?.values.map((x) => x.label).join(' · ')}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {!offers.length && canBuy && <QtyStepper qty={qty} h={56} onDec={() => setQty((q) => Math.max(1, q - 1))} onInc={() => setQty((q) => q + 1)} />}
                <button className="btn btn-primary" disabled={!canBuy} style={{ flex: 1, minWidth: 0, height: 56, opacity: canBuy ? 1 : 0.4 }} onClick={buy}>{canBuy ? 'Ajouter au panier' : p.purchasable ? 'Épuisé' : 'Non disponible à la vente'}</button>
              </div>
              {canBuy && (
                <button className="btn btn-outline" style={{ height: 52 }} onClick={buyNow}>
                  Acheter maintenant · {fmt(packTotal)}{packTotal < packSum ? <span style={{ marginLeft: 8, textDecoration: 'line-through', opacity: 0.55 }}>{fmt(packSum)}</span> : null}
                </button>
              )}
              <button onClick={() => toggleFav(p.id)} aria-pressed={fav} style={{ ...label, height: 44, background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <HeartIcon size={16} fill={fav ? 'currentColor' : 'none'} />{fav ? 'Dans vos favoris' : 'Ajouter aux favoris'}
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--line)' }}>
              {tabs.map(([t, body], i) => (
                <div key={t} style={{ borderBottom: '1px solid var(--line)' }}>
                  <button onClick={() => setTab(tab === i ? -1 : i)} aria-expanded={tab === i}
                    style={{ ...label, letterSpacing: '.16em', width: '100%', minHeight: 54, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}>
                    {t}<span aria-hidden="true" style={{ fontSize: 18, fontWeight: 400 }}>{tab === i ? '−' : '+'}</span>
                  </button>
                  {tab === i && <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.7, color: 'var(--body)' }}>{body}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-reveal style={{ maxWidth: 1360, margin: '0 auto', padding: '72px 24px 0', display: 'grid', gridTemplateColumns: L.split2, gap: L.pGap }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
          <span className="eyebrow">Avis clients</span>
          <span className="display" style={{ fontSize: 64, lineHeight: 1 }}>{ratingF(p.rating)}</span>
          <span style={{ letterSpacing: '.14em' }}>{stars(p.rating)}</span>
          <span style={{ fontSize: 13.5, color: 'var(--graphite)' }}>Basé sur {p.reviews} avis vérifiés</span>
          <button className="btn btn-outline" style={{ marginTop: 8, height: 48, padding: '0 24px', fontSize: 11.5 }}>Écrire un avis</button>
        </div>
        <div>
          {!shownReviews.length && <p style={{ margin: 0, padding: '24px 0', borderTop: '1px solid var(--line)', fontSize: 15, color: 'var(--muted)' }}>Aucun avis publié pour le moment.</p>}
          {shownReviews.map((rv) => (
            <article key={rv.id} style={{ padding: '24px 0', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ letterSpacing: '.12em', fontSize: 13 }} aria-label={`Note ${rv.rating} sur 5`}>{stars(rv.rating)}</span>
                <span style={{ ...label, letterSpacing: '.12em' }}>{rv.author} · {MONTH.format(new Date(rv.createdAt))} · Achat vérifié</span>
              </div>
              {rv.title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{rv.title}</h3>}
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'var(--body)' }}>{rv.comment}</p>
            </article>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section aria-label="Complétez la tenue" style={{ maxWidth: 1360, margin: '0 auto', padding: '72px 24px 88px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '.06em' }}>COMPLÉTEZ LA TENUE</h2>
          <ProductGrid items={similar} />
        </section>
      )}

      {L.mobile && (
        // Barre d'achat mobile : prix et coloris, ajout au panier (icône) et achat direct vers le formulaire de commande.
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 45, background: 'var(--paper)', borderTop: '1px solid var(--line)', padding: '10px 16px calc(10px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 'none', maxWidth: '34%' }}>
            <span style={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(packTotal)}</span>
            {packTotal < packSum
              ? <span style={{ fontSize: 12, color: 'var(--graphite)', textDecoration: 'line-through' }}>{fmt(packSum)}</span>
              : old != null && old > price && units === 1 && <span style={{ fontSize: 12, color: 'var(--graphite)', textDecoration: 'line-through' }}>{fmt(old)}</span>}
            <span style={{ fontSize: 12, color: 'var(--graphite)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {units > 1 ? `${units} articles` : variant && (p.options ?? []).length > 0 ? variant.values.map((v) => v.label).join(' · ') : ''}
            </span>
          </div>
          {canBuy ? (
            <>
              <button className="btn btn-outline" onClick={buy} aria-label="Ajouter au panier" style={{ marginLeft: 'auto', flex: 'none', width: 50, height: 50, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BagIcon size={20} />
              </button>
              <button className="btn btn-primary" onClick={buyNow} style={{ flex: 1, minWidth: 0, height: 50, padding: '0 12px', fontSize: 12, letterSpacing: '.1em', whiteSpace: 'nowrap' }}>Acheter maintenant</button>
            </>
          ) : (
            <button className="btn btn-primary" disabled style={{ marginLeft: 'auto', flex: 1, height: 50, fontSize: 11.5, letterSpacing: '.14em', opacity: 0.4 }}>{p.purchasable ? 'Épuisé' : 'Non disponible'}</button>
          )}
        </div>
      )}
    </>
  );
}
