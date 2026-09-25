import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Video, ShieldCheck, X, LocateFixed, Navigation, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import SearchBar from "../components/SearchBar";
import DoctorCard from "../components/DoctorCard";
import BookingModal from "../components/BookingModal";
import DoctorProfileModal from "../components/DoctorProfileModal";
import api from "../lib/api";

const REFERENCE_POINTS = [
  { label: "Montréal, centre-ville", lat: 45.5017, lng: -73.5673 },
  { label: "Montréal, Côte-des-Neiges", lat: 45.4960, lng: -73.6220 },
  { label: "Laval", lat: 45.5600, lng: -73.7120 },
  { label: "Longueuil", lat: 45.5312, lng: -73.5181 },
  { label: "Québec", lat: 46.8139, lng: -71.2080 },
  { label: "Sherbrooke", lat: 45.4042, lng: -71.8929 },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tele, setTele] = useState(false);
  const [position, setPosition] = useState(null); // {lat, lng, label}
  const [locating, setLocating] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [maxKm, setMaxKm] = useState("");

  const [booking, setBooking] = useState(null); // {doctor, date, time}
  const [profile, setProfile] = useState(null); // doctor

  const filters = useMemo(() => ({
    specialty: params.get("specialty") || "",
    city: params.get("city") || "",
    language: params.get("language") || "",
    insurance: params.get("insurance") || "",
  }), [params]);

  useEffect(() => {
    api.get("/facets").then(({ data }) => setFacets(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && q.set(k, v));
    if (tele) q.set("teleconsultation", "true");
    if (position) {
      q.set("lat", position.lat);
      q.set("lng", position.lng);
      if (maxKm) q.set("max_km", maxKm);
    }
    if (sort !== "relevance") q.set("sort", sort);
    api.get(`/doctors?${q.toString()}`)
      .then(({ data }) => setDoctors(data.doctors))
      .catch(() => toast.error("Impossible de charger les médecins."))
      .finally(() => setLoading(false));
  }, [filters, tele, position, sort, maxKm]);

  function locateMe() {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lng: coords.longitude, label: "Ma position" });
        setSort("distance");
        setLocating(false);
        toast.success("Position détectée, médecins triés du plus proche au plus éloigné.");
      },
      () => {
        setLocating(false);
        toast.error("Position refusée. Choisissez un point de référence ci-dessous.");
      },
      { timeout: 8000 }
    );
  }

  function pickReference(label) {
    const ref = REFERENCE_POINTS.find((r) => r.label === label);
    if (!ref) {
      setPosition(null);
      if (sort === "distance") setSort("relevance");
      return;
    }
    setPosition(ref);
    setSort("distance");
  }

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  const activeChips = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Trouver un médecin</h1>
        <p className="mt-1 text-ink-500">Des professionnels de santé qui accueillent les patients sans RAMQ.</p>
      </div>

      <SearchBar facets={facets} initial={filters} variant="page" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2 text-ink-900">
              <SlidersHorizontal size={18} className="text-brand-500" />
              <span className="font-display font-bold">Filtres</span>
            </div>

            <FilterGroup label="Spécialité" value={filters.specialty} options={facets?.specialties} onChange={(v) => setFilter("specialty", v)} testid="filter-specialty" />
            <FilterGroup label="Ville" value={filters.city} options={facets?.cities} onChange={(v) => setFilter("city", v)} testid="filter-city" />
            <FilterGroup label="Langue parlée" value={filters.language} options={facets?.languages} onChange={(v) => setFilter("language", v)} testid="filter-language" />
            <FilterGroup label="Assurance acceptée" value={filters.insurance} options={facets?.insurances} onChange={(v) => setFilter("insurance", v)} testid="filter-insurance" />

            <label className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={tele}
                onChange={(e) => setTele(e.target.checked)}
                data-testid="filter-tele-checkbox"
                className="h-4 w-4 accent-brand-500"
              />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                <Video size={15} className="text-teal-600" /> Téléconsultation seulement
              </span>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" data-testid="distance-panel">
            <div className="mb-3 flex items-center gap-2 text-ink-900">
              <Navigation size={18} className="text-brand-500" />
              <span className="font-display font-bold">Proximité</span>
            </div>
            <button
              type="button"
              onClick={locateMe}
              disabled={locating}
              data-testid="locate-me-btn"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-500 transition-colors hover:bg-blue-100 disabled:opacity-60"
            >
              <LocateFixed size={16} className={locating ? "animate-pulse" : ""} />
              {locating ? "Localisation..." : "Autour de moi"}
            </button>
            <span className="mb-1.5 mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-500">Ou un point de référence</span>
            <select
              value={position?.label && position.label !== "Ma position" ? position.label : ""}
              onChange={(e) => pickReference(e.target.value)}
              data-testid="reference-point-select"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
            >
              <option value="">Aucun</option>
              {REFERENCE_POINTS.map((r) => <option key={r.label}>{r.label}</option>)}
            </select>
            {position && (
              <>
                <span className="mb-1.5 mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-500">Rayon maximal</span>
                <select
                  value={maxKm}
                  onChange={(e) => setMaxKm(e.target.value)}
                  data-testid="max-km-select"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                >
                  <option value="">Sans limite</option>
                  {[5, 10, 25, 50, 100].map((k) => <option key={k} value={k}>{k} km</option>)}
                </select>
                <p className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-700" data-testid="position-label">
                  <span className="truncate font-semibold">{position.label}</span>
                  <button type="button" onClick={() => pickReference("")} className="ml-2 text-ink-500 hover:text-rose-600" data-testid="clear-position-btn" aria-label="Retirer la position"><X size={14} /></button>
                </p>
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <div className="flex items-center gap-2 text-teal-700">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold">Tous acceptent sans RAMQ</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-teal-700/80">
              Chaque médecin listé prend en charge les patients avec assurance privée ou paiement direct.
            </p>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink-700" data-testid="results-count">
              {loading ? "Recherche..." : `${doctors.length} médecin${doctors.length > 1 ? "s" : ""} disponible${doctors.length > 1 ? "s" : ""}`}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k, "")}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500 hover:bg-blue-100"
                >
                  {v} <X size={12} />
                </button>
              ))}
              <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink-700">
                <ArrowUpDown size={14} className="text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  data-testid="sort-select"
                  className="appearance-none bg-transparent font-semibold outline-none"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="distance" disabled={!position}>Les plus proches</option>
                  <option value="price">Prix croissant</option>
                  <option value="rating">Mieux notés</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="font-display text-lg font-bold text-ink-900">Aucun médecin trouvé</p>
              <p className="mt-1 text-sm text-ink-500">Essayez d'élargir vos critères de recherche.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {doctors.map((d, i) => (
                <DoctorCard
                  key={d.id}
                  doctor={d}
                  index={i}
                  onBook={(doctor, date, time) => setBooking({ doctor, date, time })}
                  onOpen={(doctor) => setProfile(doctor)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {profile && (
        <DoctorProfileModal
          doctor={profile}
          onClose={() => setProfile(null)}
          onBook={(doctor, date, time) => {
            setProfile(null);
            setBooking({ doctor, date, time });
          }}
        />
      )}

      {booking && (
        <BookingModal
          doctor={booking.doctor}
          initialDate={booking.date}
          initialTime={booking.time}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}

function FilterGroup({ label, value, options = [], onChange, testid }) {
  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testid}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
        >
          <option value="">Toutes</option>
          {(options || []).map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}
