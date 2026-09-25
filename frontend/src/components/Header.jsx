import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, Menu, X, CalendarCheck } from "lucide-react";

const links = [
  { to: "/recherche", label: "Trouver un médecin" },
  { to: "/rendez-vous", label: "Mes rendez-vous" },
  { to: "/suivi", label: "Historique et suivi" },
  { to: "/profil", label: "Profil sans RAMQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="brand-logo">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
            <Stethoscope size={22} strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
            Doc<span className="text-teal-600">Live</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.to.replace("/", "")}`}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-brand-50 text-brand-500" : "text-ink-700 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/recherche")}
            data-testid="header-book-btn"
            className="hidden items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-200 hover:bg-brand-600 active:scale-95 sm:inline-flex"
          >
            <CalendarCheck size={17} /> Prendre rendez-vous
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden" data-testid="mobile-menu">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/recherche");
              }}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            >
              <CalendarCheck size={17} /> Prendre rendez-vous
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
