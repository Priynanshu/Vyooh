import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Menu, X, LayoutDashboard, LogOut, User, History } from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { APP_NAME } from "../../constants";

const NAV_LINKS = [
  { label: "Home",    to: "/" },
  { label: "Movies",  to: "/browse?type=movie" },
  { label: "Series",  to: "/browse?type=series" },
  {label: "Foryou", to: "/recommendations"}
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate   = useNavigate();
  const searchRef  = useRef(null);
  const menuRef    = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false); setQuery("");
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-prime-bg border-b border-prime-border shadow-lg" : ""}`}
      style={!scrolled ? {background:"linear-gradient(to bottom,rgba(15,23,30,0.95),transparent)"} : {}}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-14 sm:h-16">

        {/* Logo + Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{background:"#00A8E1"}}>
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide hidden sm:block">{APP_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink key={link.label} to={link.to}
                className={({isActive}) => `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive ? "text-white bg-prime-elevated" : "text-prime-muted hover:text-white hover:bg-prime-elevated/50"}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form initial={{width:0,opacity:0}} animate={{width:"auto",opacity:1}}
                  exit={{width:0,opacity:0}} transition={{duration:0.25}}
                  onSubmit={handleSearch} className="overflow-hidden mr-1">
                  <input ref={searchRef} autoFocus value={query} onChange={e=>setQuery(e.target.value)}
                    placeholder="Search titles..."
                    className="bg-prime-elevated border border-prime-border rounded px-3 py-1.5 text-sm text-white placeholder:text-prime-subtle w-40 sm:w-52 focus:outline-none focus:border-prime-accent"/>
                </motion.form>
              )}
            </AnimatePresence>
            <button onClick={() => { setSearchOpen(v=>!v); if(!searchOpen) setTimeout(()=>searchRef.current?.focus(),100); }}
              className="w-8 h-8 flex items-center justify-center rounded text-prime-muted hover:text-white hover:bg-prime-elevated transition-colors">
              {searchOpen ? <X size={18}/> : <Search size={18}/>}
            </button>
          </div>

          {/* Admin shortcut */}
          {isAdmin && (
            <Link to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-prime-accent border border-prime-accent/20 hover:bg-prime-accent/10 transition-colors">
              <LayoutDashboard size={13}/> Admin
            </Link>
          )}

          {/* User menu / Auth */}
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(v=>!v)}
                className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded hover:bg-prime-elevated transition-colors">
                <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-xs font-bold" style={{background:"#00A8E1"}}>
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <ChevronDown size={14} className={`text-prime-muted transition-transform ${menuOpen?"rotate-180":""}`}/>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{opacity:0,y:-8,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
                    exit={{opacity:0,y:-8,scale:0.97}} transition={{duration:0.15}}
                    className="absolute right-0 top-10 w-52 bg-prime-surface border border-prime-border rounded shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-prime-border">
                      <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
                      <p className="text-prime-muted text-xs truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={()=>setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-prime-muted hover:text-white hover:bg-prime-elevated transition-colors">
                        <User size={15}/> Profile
                      </Link>
                      <Link to="/profile" onClick={()=>setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-prime-muted hover:text-white hover:bg-prime-elevated transition-colors">
                        <History size={15}/> Watch History
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={()=>setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-prime-accent hover:bg-prime-elevated transition-colors">
                          <LayoutDashboard size={15}/> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-prime-border py-1">
                      <button onClick={()=>{setMenuOpen(false);logout();}}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-prime-elevated transition-colors">
                        <LogOut size={15}/> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-prime-muted hover:text-white transition-colors">Sign in</Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-semibold text-white rounded transition-colors" style={{background:"#00A8E1"}}>
                Start free
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="md:hidden w-8 h-8 flex items-center justify-center text-prime-muted hover:text-white"
            onClick={()=>setMobileOpen(v=>!v)}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} transition={{duration:0.2}}
            className="md:hidden bg-prime-surface border-t border-prime-border overflow-hidden">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <NavLink key={link.label} to={link.to} onClick={()=>setMobileOpen(false)}
                  className={({isActive})=>`px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive?"text-white bg-prime-elevated":"text-prime-muted hover:text-white"}`}>
                  {link.label}
                </NavLink>
              ))}
              {isLoggedIn && (
                <Link to="/profile" onClick={()=>setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-prime-muted hover:text-white">
                  Profile
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={()=>setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-prime-accent">
                  Admin Dashboard
                </Link>
              )}
              {isLoggedIn && (
                <button onClick={()=>{setMobileOpen(false);logout();}}
                  className="px-3 py-2.5 text-sm text-red-400 text-left">
                  Sign out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
