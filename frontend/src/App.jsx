import { Routes, Route, useLocation } from "react-router-dom";
import Navbar  from "./components/layout/Navbar";
import Footer  from "./components/layout/Footer";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/common/RouteGuards";

import Home          from "./pages/Home";
import Browse        from "./pages/Browse";
import Search        from "./pages/Search";
import TitleDetails  from "./pages/TitleDetails";
import Watch         from "./pages/Watch";
import Profile       from "./pages/Profile";
import Recommendations from "./pages/Recommendations";

import Login         from "./features/auth/components/Login";
import Register      from "./features/auth/components/Register";

import AdminLayout   from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUpload   from "./pages/admin/AdminUpload";
import AdminContent  from "./pages/admin/AdminContent";
import WatchYouTube from "./pages/watchYouTube";

export default function App() {
  const location = useLocation();
  const isWatch  = location.pathname.startsWith("/watch");
  const isAuth   = ["/login", "/register"].includes(location.pathname);
  const isAdmin  = location.pathname.startsWith("/admin");
  const showChrome = !isWatch && !isAuth && !isAdmin;

  return (
    <div className="min-h-screen bg-prime-bg">
      {showChrome && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/"          element={<Home />} />
        <Route path="/browse"    element={<Browse />} />
        <Route path="/search"    element={<Search />} />
        <Route path="/title/:id" element={<TitleDetails />} />

        {/* Guest only */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected */}
        <Route path="/watch/:id"       element={<ProtectedRoute><Watch /></ProtectedRoute>} />
        <Route path="/watch-yt/:id" element={<ProtectedRoute><WatchYouTube /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index           element={<AdminDashboard />} />
          <Route path="upload"   element={<AdminUpload />} />
          <Route path="content"  element={<AdminContent />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p className="text-6xl font-bold text-prime-accent mb-4">404</p>
            <p className="text-prime-muted mb-6">Yeh page exist nahi karta.</p>
            <a href="/" className="px-5 py-2.5 rounded font-semibold text-white text-sm" style={{background:"#00A8E1"}}>
              Go Home
            </a>
          </div>
        }/>
      </Routes>

      {showChrome && <Footer />}
    </div>
  );
}
