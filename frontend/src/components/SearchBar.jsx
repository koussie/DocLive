import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Globe, ShieldCheck, ChevronDown } from "lucide-react";

export default function SearchBar({ facets, initial = {}, variant = "hero" }) {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(initial.specialty || "");
  const [city, setCity] = useState(initial.city || "");
  const [language, setLanguage] = useState(initial.language || "");
  const [insurance, setInsurance] = useState(initial.insurance || "");

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    if (language) params.set("language", language);
    if (insurance) params.set("insurance", insurance);
    navigate(`/recherche?${params.toString()}`);
  }

  const wrapper =
    variant === "hero"
      ? "rounded-2xl bg-white p-3 shadow-lift ring-1 ring-slate-200"
      : "rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-200";

  const cell = "flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-slate-50 focus-within:bg-slate-50";
  const selectCls = "w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm font-semibold text-ink-900 outline-none";
  const chevron = "pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400";

  return (
    <form onSubmit={submit} className={wrapper} data-testid="search-bar">
      <div className={`grid gap-1 sm:grid-cols-2 ${variant === "page" ? "xl:grid-cols-[1.25fr_1fr_1fr_1.15fr_auto]" : ""}`}>
        <div className={cell}>
          <Search size={18} className="shrink-0 text-brand-500" />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Spécialité</span>
            <div className="relative">
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectCls} data-testid="search-specialty">
                <option value="">Toutes les spécialités</option>
                {(facets?.specialties || []).map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={15} className={chevron} />
            </div>
          </div>
        </div>

        <div className={`${cell} sm:border-l sm:border-slate-100`}>
          <MapPin size={18} className="shrink-0 text-brand-500" />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Ville</span>
            <div className="relative">
              <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls} data-testid="search-city">
                <option value="">Toutes les villes</option>
                {(facets?.cities || []).map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={15} className={chevron} />
            </div>
          </div>
        </div>

        <div className={cell}>
          <Globe size={18} className="shrink-0 text-brand-500" />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Langue</span>
            <div className="relative">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectCls} data-testid="search-language">
                <option value="">Toutes les langues</option>
                {(facets?.languages || []).map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={15} className={chevron} />
            </div>
          </div>
        </div>

        <div className={`${cell} sm:border-l sm:border-slate-100`}>
          <ShieldCheck size={18} className="shrink-0 text-teal-600" />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Couverture</span>
            <div className="relative">
              <select value={insurance} onChange={(e) => setInsurance(e.target.value)} className={selectCls} data-testid="search-insurance">
                <option value="">Toutes les assurances</option>
                {(facets?.insurances || []).map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={15} className={chevron} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          data-testid="search-submit-btn"
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-[transform,background-color] duration-200 hover:bg-brand-600 active:scale-95 sm:col-span-2 ${variant === "page" ? "xl:col-span-1" : ""}`}
        >
          <Search size={18} /> Rechercher
        </button>
      </div>
    </form>
  );
}
