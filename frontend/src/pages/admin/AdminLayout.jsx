import { NavLink, Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Upload, Film, Users, ArrowLeft, BarChart2 } from "lucide-react";
import { APP_NAME } from "../../constants";

const NAV = [
  { label: "Dashboard",      to: "/admin",         icon: LayoutDashboard, end: true },
  { label: "Upload Content", to: "/admin/upload",  icon: Upload },
  { label: "Manage Content", to: "/admin/content", icon: Film },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-prime-bg flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-prime-surface border-r border-prime-border fixed top-0 bottom-0 left-0 z-40">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-prime-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-prime-accent rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-prime-text font-bold text-base">{APP_NAME}</span>
          </Link>
          <p className="text-prime-muted text-[10px] mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-prime text-sm transition-colors ${
                  isActive
                    ? "bg-prime-accent/15 text-prime-accent font-semibold"
                    : "text-prime-muted hover:text-prime-text hover:bg-prime-elevated"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to site */}
        <div className="px-2 pb-4 border-t border-prime-border pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-prime text-sm text-prime-muted hover:text-prime-text hover:bg-prime-elevated transition-colors"
          >
            <ArrowLeft size={17} /> Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-prime-surface border-b border-prime-border flex overflow-x-auto no-scrollbar">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-prime-accent text-prime-accent"
                  : "border-transparent text-prime-muted"
              }`
            }
          >
            <item.icon size={14} /> {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-56 mt-12 md:mt-0 px-4 sm:px-6 py-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
