import { lazy, Suspense } from "react";
import Home from "./pages/Home.jsx";
import NavBar from "./navigation/NavBar.jsx";
import Footer from "./navigation/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import WpButton from "./components/WpButton.jsx";
import ErrorCarga from "./components/ErrorCarga.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import ScrollToTop from "./utils/ScrollToTop.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./css/tokens.css";
import "./App.css";

// Cada página se descarga recién cuando se visita (antes todo el sitio venía en un solo
// archivo de 724 KB). La Home queda incluida porque es la página de entrada más común.
const ProductosPage = lazy(() => import("./pages/ProductosPage.jsx"));
const Contacto = lazy(() => import("./pages/Contacto.jsx"));
const Perfil = lazy(() => import("./pages/Perfiles/Perfil.jsx"));
const ItemDetail = lazy(() => import("./pages/ItemDetail.jsx"));
const CartDetail = lazy(() => import("./pages/CartDetail.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Gracias = lazy(() => import("./pages/Gracias.jsx"));
const Nosotros = lazy(() => import("./pages/Nosotros.jsx"));
const Faq = lazy(() => import("./pages/Faq.jsx"));

// Un reintento ante errores (el default de 3 hacía esperar mucho antes de mostrar el error)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div style={{ paddingTop: isHome ? 0 : 80 }} className="app-layout">
      <NavBar />
      <main>
        <ScrollToTop />
        {/* Mientras baja el código de la página se reserva el alto de la pantalla
            (si no, el footer aparece arriba y salta) */}
        <ErrorCarga key={location.pathname}>
          <Suspense fallback={<div className="ruta-cargando" />}>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/productos" element={<ProductosPage />} />
              {/* La Caja de herramientas se eliminó: los links viejos van al catálogo */}
              <Route
                path="/caja-herramientas"
                element={<Navigate to="/productos" replace />}
              />
              <Route exact path="/contacto" element={<Contacto />} />
              <Route exact path="/nosotros" element={<Nosotros />} />
              <Route exact path="/faq" element={<Faq />} />
              <Route exact path="/producto/:prodId" element={<ItemDetail />} />
              <Route exact path="/carrito/:cartId" element={<CartDetail />} />
              <Route exact path="/checkout/:cartId" element={<Checkout />} />
              <Route
                exact
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route exact path="/gracias" element={<Gracias />} />
            </Routes>
          </Suspense>
        </ErrorCarga>
        <WpButton />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
