import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useCatalog } from './catalog';
import { AccessGate } from './components/AccessGate';
import { Footer, Header, Overlays, TopBar } from './components/Shell';
import { useLayout, useReveal } from './layout';
import Admin from './pages/Admin';
import Cart, { Checkout } from './pages/Cart';
import { About, Account, Contact, Faq, Legal, NotFound } from './pages/Content';
import Home from './pages/Home';
import Product from './pages/Product';
import Shop, { Collections, Favorites } from './pages/Shop';
import { flushPixel, initPixel, track } from './pixel';
import { PATHS } from './routes';
import { HOME_TITLE, SHOP_PITCH, setMeta } from './seo';
import { useStore } from './store';

const TITLES: Record<string, string> = {
  [PATHS.favorites]: 'Favoris',
  [PATHS.collections]: 'Collections',
  [PATHS.cart]: 'Panier',
  [PATHS.checkout]: 'Commande',
  [PATHS.about]: 'À propos',
  [PATHS.contact]: 'Contact',
  [PATHS.faq]: 'Questions fréquentes',
  [PATHS.cgv]: 'Conditions générales de vente',
  [PATHS.privacy]: 'Confidentialité',
  [PATHS.account]: 'Mon compte',
};
/** Pages de la boutique : mêmes titres que l'API (backend/src/catalog/seo.controller.ts). */
const SHOP_TITLES: Record<string, string> = {
  '/produits': 'Toute la boutique',
  '/produits/homme': 'Vêtements homme',
  '/produits/femme': 'Vêtements femme',
  '/produits/vestes': 'Vestes',
  '/produits/hauts': 'Hauts',
  '/produits/pantalons': 'Pantalons',
  '/produits/robes': 'Robes',
  '/produits/accessoires': 'Accessoires',
  '/produits/nouveautes': 'Nouveautés',
  '/produits/promos': 'Promos',
};
/** Pages personnelles : jamais dans les résultats de recherche. */
const PRIVATE = [PATHS.cart, PATHS.checkout, PATHS.account, PATHS.favorites];

export default function App() {
  const L = useLayout();
  const { pathname } = useLocation();
  const { closeAll } = useStore();
  const { site, unlocked } = useCatalog();

  useReveal(pathname);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    closeAll();
    // Fiche produit : balises posées par la page elle-même (nom, prix, description).
    if (pathname.startsWith('/produit/')) return;
    if (pathname.startsWith(PATHS.admin)) { setMeta({ title: 'Administration — VASYCIAO', path: pathname, noindex: true }); return; }
    if (pathname === '/') { setMeta({ title: HOME_TITLE, path: '/' }); return; }
    const shop = SHOP_TITLES[pathname];
    const t = shop ?? TITLES[pathname] ?? 'Boutique';
    setMeta({
      title: `${t} — VASYCIAO`,
      description: shop ? `${shop} au Maroc, boutique VASYCIAO. ${SHOP_PITCH}` : undefined,
      path: pathname,
      noindex: PRIVATE.includes(pathname) || (!shop && !TITLES[pathname]),
    });
  }, [pathname, closeAll]);
  // Pixel Meta : une vue de page à chaque changement d'adresse (pas dans l'administration).
  useEffect(() => {
    if (!site || pathname.startsWith(PATHS.admin)) return;
    if (site.pixelId) {
      initPixel(site.pixelId);
      track('PageView');
    }
    flushPixel();
  }, [pathname, site]);

  if (pathname.startsWith(PATHS.admin)) return <Admin />;
  // Boutique en accès privé : rien n'est affiché avant la saisie du code.
  if (!site) return <div style={{ minHeight: '100vh', background: '#ECEBE8' }} />;
  if (site.private && !site.unlocked) return <div className="store"><AccessGate onUnlock={unlocked} /></div>;

  const isHome = pathname === '/';
  const isProduct = pathname.startsWith('/produit/');
  const mainPb = isProduct && L.mobile ? '200px' : isHome ? '0px' : L.sec;

  return (
    <div className="store" style={{ minHeight: '100vh', background: 'var(--ivory)', color: 'var(--ink)', overflowX: 'clip', position: 'relative' }}>
      <TopBar />
      <Header />
      <main style={{ paddingBottom: mainPb }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produits" element={<Shop />} />
          <Route path="/produits/:cat" element={<Shop />} />
          <Route path="/produit/:id" element={<Product />} />
          <Route path={PATHS.collections} element={<Collections />} />
          <Route path={PATHS.cart} element={<Cart />} />
          <Route path={PATHS.checkout} element={<Checkout />} />
          <Route path={PATHS.about} element={<About />} />
          <Route path={PATHS.contact} element={<Contact />} />
          <Route path={PATHS.faq} element={<Faq />} />
          <Route path={PATHS.cgv} element={<Legal kind="cgv" />} />
          <Route path={PATHS.privacy} element={<Legal kind="privacy" />} />
          <Route path={PATHS.account} element={<Account />} />
          <Route path={PATHS.favorites} element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Overlays />
    </div>
  );
}
