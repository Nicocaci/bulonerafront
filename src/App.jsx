import Home from "./pages/Home.jsx";
import ProductosPage from "./pages/ProductosPage.jsx";
import Contacto from "./pages/Contacto.jsx";
import Perfil from "./pages/Perfiles/Perfil.jsx";
import NavBar from "./navigation/NavBar.jsx";
import Footer from "./navigation/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import CartDetail from "./pages/CartDetail.jsx";
import Checkout from "./pages/Checkout.jsx";  
import Gracias from "./pages/Gracias.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import CajaHerramientas from "./pages/CajaHerramientas.jsx";
import WpButton from "./components/WpButton.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import './App.css'





function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <div id="root">
              <NavBar />
            <main>
            <Routes>
              <Route exact path="/" element={<Home/>}/>
              <Route exact path="/productos" element={<ProductosPage/>}/>
              <Route exact path="/caja-herramientas" element={<CajaHerramientas/>}/>
              <Route exact path="/contacto" element={<Contacto/>}/>
              <Route exact path="/nosotros" element={<Nosotros/>}/>
              <Route exact path="/producto/:prodId" element={<ItemDetail/>}/>
              <Route exact path="/carrito/:cartId" element={<CartDetail/>}/>  
              <Route exact path="/checkout/:cartId" element={
                  <ProtectedRoute>
                    <Checkout/>
                  </ProtectedRoute>
                }
              />
              <Route exact path="/perfil" element={
                  <ProtectedRoute>
                    <Perfil/>
                  </ProtectedRoute>
                }
              />
              <Route exact path="/gracias" element={
                <ProtectedRoute>
                  <Gracias/>
                </ProtectedRoute>
              }/>
            </Routes>
            <WpButton/>
            </main>
            <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
      </QueryClientProvider>
    </>
  )
}

export default App;
