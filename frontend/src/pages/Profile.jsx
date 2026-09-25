import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle, Flag, Contact, ShieldCheck,
  Save, CheckCircle2,
} from "lucide-react";
import { Button, Field, Input, Select } from "../components/ui";
import api from "../lib/api";

const PERMITS = ["Permis d'études", "Permis de travail ouvert", "Permis de travail fermé", "PVT (vacances-travail)", "Résident temporaire", "Visiteur"];
const INSURERS = ["Guard.me", "MSH", "Croix Bleue", "Sun Life", "Desjardins", "Allianz", "Sans assurance (paiement direct)"];

export default function Profile() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/profile").then(({ data }) => setForm(data));
  }, []);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/profile", form);
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <div className="mx-auto max-w-3xl px-4 py-16"><div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Profil patient sans RAMQ</h1>
        <p className="mt-1 text-ink-500">Renseignez votre statut au Québec et votre assurance privée pour accélérer vos prises de rendez-vous.</p>
      </div>

      {/* Header card */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <UserCircle size={34} />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-ink-900">{form.name}</p>
          <p className="text-sm text-ink-500">{form.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
              <ShieldCheck size={12} /> {form.insurer}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-500">
              <Contact size={12} /> {form.permit_type}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-ink-900">
            <UserCircle size={18} className="text-brand-500" /> Informations personnelles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet"><Input value={form.name || ""} onChange={update("name")} data-testid="profile-name" /></Field>
            <Field label="Courriel"><Input type="email" value={form.email || ""} onChange={update("email")} data-testid="profile-email" /></Field>
            <Field label="Téléphone"><Input value={form.phone || ""} onChange={update("phone")} data-testid="profile-phone" /></Field>
            <Field label="Date de naissance"><Input type="date" value={form.birthdate || ""} onChange={update("birthdate")} data-testid="profile-birthdate" /></Field>
            <Field label="Nationalité"><Input value={form.nationality || ""} onChange={update("nationality")} data-testid="profile-nationality" /></Field>
            <Field label="Numéro de passeport"><Input value={form.passport_number || ""} onChange={update("passport_number")} data-testid="profile-passport" /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-ink-900">
            <Flag size={18} className="text-brand-500" /> Statut au Québec
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type de permis" hint="Votre statut d'immigration actuel">
              <Select value={form.permit_type || ""} onChange={update("permit_type")} data-testid="profile-permit">
                {PERMITS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-ink-900">
            <ShieldCheck size={18} className="text-teal-600" /> Assurance santé privée
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assureur">
              <Select value={form.insurer || ""} onChange={update("insurer")} data-testid="profile-insurer">
                {INSURERS.map((i) => <option key={i}>{i}</option>)}
              </Select>
            </Field>
            <Field label="Numéro de police"><Input value={form.policy_number || ""} onChange={update("policy_number")} data-testid="profile-policy" /></Field>
          </div>
          <Field label="Détails de couverture">
            <textarea
              value={form.coverage || ""}
              onChange={update("coverage")}
              data-testid="profile-coverage"
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
            />
          </Field>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving} data-testid="profile-save-btn">
            <Save size={17} /> {saving ? "Enregistrement..." : "Enregistrer le profil"}
          </Button>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm font-semibold text-teal-600"
                data-testid="profile-saved-msg"
              >
                <CheckCircle2 size={16} /> Profil enregistré
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
