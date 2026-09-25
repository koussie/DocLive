import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck, Globe, Video, CalendarCheck, Search, FileText,
  Stethoscope, HeartPulse, Baby, Brain, Smile, Sparkles, ArrowRight, Star,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../lib/api";

const SPECIALTIES = [
  { name: "Médecine générale", icon: Stethoscope },
  { name: "Dermatologie", icon: Sparkles },
  { name: "Pédiatrie", icon: Baby },
  { name: "Gynécologie", icon: HeartPulse },
  { name: "Santé mentale", icon: Brain },
  { name: "Dentisterie", icon: Smile },
];

const STEPS = [
  { icon: Search, title: "Cherchez", text: "Filtrez par spécialité, ville, langue parlée et couverture d'assurance privée." },
  { icon: CalendarCheck, title: "Réservez", text: "Choisissez un créneau au cabinet ou en téléconsultation, en quelques secondes." },
  { icon: FileText, title: "Suivez", text: "Retrouvez vos ordonnances et reçus pour vous faire rembourser facilement." },
];

export default function Home() {
  const [facets, setFacets] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get("/facets").then(({ data }) => setFacets(data)).catch(() => {});
    api.get("/doctors").then(({ data }) => setDoctors(data.doctors.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-backdrop opacity-70" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-8 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700"
            >
              <ShieldCheck size={15} /> Pensé pour les étudiants et travailleurs sans RAMQ
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl"
            >
              Un médecin au Québec,<br /> même sans carte RAMQ.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500"
            >
              Accédez en quelques clics à des consultations en médecine générale, spécialistes et cliniques privées adaptées aux étudiants étrangers et travailleurs temporaires.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-7"
            >
              <SearchBar facets={facets} variant="hero" />
            </motion.div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="flex items-center gap-1.5"><Globe size={16} className="text-brand-500" /> Médecins multilingues</span>
              <span className="flex items-center gap-1.5"><Video size={16} className="text-brand-500" /> Téléconsultation</span>
              <span className="flex items-center gap-1.5"><FileText size={16} className="text-brand-500" /> Reçus pour assurance</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative hidden lg:block"
          >
            <img
              src="https://images.pexels.com/photos/7578798/pexels-photo-7578798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Consultation médicale"
              className="h-full max-h-[520px] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute bottom-5 left-5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-50 text-teal-600"><ShieldCheck size={18} /></span>
                <div>
                  <p className="text-sm font-bold text-ink-900">Sans RAMQ acceptée</p>
                  <p className="text-xs text-ink-500">Assurances privées prises en charge</p>
                </div>
              </div>
            </div>
            <div className="absolute right-5 top-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-ink-900">4.9</span>
                <span className="text-xs text-ink-500">1 200+ avis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Specialties */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Explorez par spécialité</h2>
            <p className="mt-1 text-ink-500">Trouvez le bon professionnel pour votre besoin.</p>
          </div>
          <Link to="/recherche" className="hidden items-center gap-1 text-sm font-semibold text-brand-500 hover:gap-2 sm:inline-flex">
            Tout voir <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SPECIALTIES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                to={`/recherche?specialty=${encodeURIComponent(s.name)}`}
                data-testid={`specialty-${s.name}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <s.icon size={22} />
                </span>
                <span className="text-sm font-semibold text-ink-900">{s.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-ink-900 sm:text-3xl">Comment ça fonctionne</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-500">Trois étapes simples pour prendre soin de votre santé au Québec.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span className="absolute right-5 top-5 font-display text-4xl font-extrabold text-slate-200">{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500 text-white"><s.icon size={22} /></span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured doctors */}
      {doctors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-ink-900">Médecins recommandés</h2>
            <Link to="/recherche" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:gap-2">
              Voir tous <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to="/recherche"
                  className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-shadow hover:shadow-lift"
                >
                  <img src={d.photo} alt={d.nom} className="h-44 w-full object-cover" />
                  <div className="p-5">
                    <h3 className="font-display font-bold text-ink-900">{d.nom}</h3>
                    <p className="text-sm font-semibold text-teal-600">{d.specialty}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-ink-900">{d.rating.toFixed(1)}</span> ({d.reviews_count})
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-500 p-8 sm:p-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-xl">
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Votre santé ne devrait pas attendre une carte RAMQ.</h2>
            <p className="mt-3 text-blue-100">Prenez rendez-vous dès aujourd'hui avec un médecin qui vous comprend.</p>
            <Link
              to="/recherche"
              data-testid="cta-book-btn"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-500 transition-transform duration-200 hover:scale-[1.02]"
            >
              <CalendarCheck size={18} /> Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
