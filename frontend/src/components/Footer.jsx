import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, ShieldCheck, Globe, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white">
                <Stethoscope size={22} strokeWidth={2.2} />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
                Doc<span className="text-teal-600">Live</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              La santé accessible pour les étudiants étrangers et travailleurs temporaires au Québec, sans carte RAMQ.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink-900">Plateforme</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li><Link to="/recherche" className="hover:text-brand-500">Trouver un médecin</Link></li>
              <li><Link to="/rendez-vous" className="hover:text-brand-500">Mes rendez-vous</Link></li>
              <li><Link to="/suivi" className="hover:text-brand-500">Historique et suivi</Link></li>
              <li><Link to="/profil" className="hover:text-brand-500">Profil sans RAMQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink-900">Assurances acceptées</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li>Guard.me, MSH</li>
              <li>Croix Bleue, Sun Life</li>
              <li>Desjardins, Allianz</li>
              <li>Paiement direct possible</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-ink-900">Notre engagement</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-500">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-teal-600" /> Données confidentielles</li>
              <li className="flex items-center gap-2"><Globe size={16} className="text-teal-600" /> Médecins multilingues</li>
              <li className="flex items-center gap-2"><Heart size={16} className="text-teal-600" /> Accueil sans jugement</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-ink-500 sm:flex-row">
          <span>© {new Date().getFullYear()} DocLive. Démonstration présentée à titre indicatif.</span>
          <span>Montréal, Québec, Canada</span>
        </div>
      </div>
    </footer>
  );
}
