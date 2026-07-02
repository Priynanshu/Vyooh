import { Link } from "react-router-dom";
import { APP_NAME } from "../../constants";

const LINKS = [
  { heading: "Watch", links: [{ label: "Home", to: "/" }, { label: "Movies", to: "/browse?type=movie" }, { label: "Series", to: "/browse?type=series" }, { label: "For You", to: "/recommendations" }] },
  { heading: "Help", links: [{ label: "About", to: "#" }, { label: "Contact", to: "#" }, { label: "FAQ", to: "#" }] },
  { heading: "Legal", links: [{ label: "Terms", to: "#" }, { label: "Privacy", to: "#" }, { label: "Cookies", to: "#" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-prime-border mt-16 bg-prime-surface/50">
      <div className="px-4 sm:px-6 lg:px-10 py-10 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-prime-accent rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-prime-text font-bold text-lg">{APP_NAME}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          {LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-prime-text text-xs font-semibold uppercase tracking-wider mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-prime-muted text-sm hover:text-prime-text transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-prime-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-prime-subtle text-xs">
            © {new Date().getFullYear()} {APP_NAME}. Sirf demo / learning project.
          </p>
          <p className="text-prime-subtle text-xs">
            Built with React + Redux + Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
