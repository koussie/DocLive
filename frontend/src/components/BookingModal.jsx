import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Calendar, Clock, MapPin, Video, Building2, CheckCircle2,
  ShieldCheck, User, ChevronRight, ChevronLeft, Download,
} from "lucide-react";
import { Button, Field, Input, Select, Badge } from "./ui";
import api from "../lib/api";

const MOTIFS = [
  "Consultation générale",
  "Renouvellement d'ordonnance",
  "Symptômes grippaux",
  "Bilan de santé",
  "Certificat médical",
  "Suivi de traitement",
];

const PERMITS = ["Permis d'études", "Permis de travail ouvert", "Permis de travail fermé", "PVT (vacances-travail)", "Résident temporaire", "Visiteur"];
const INSURERS = ["Guard.me", "MSH", "Croix Bleue", "Sun Life", "Desjardins", "Allianz", "Sans assurance (paiement direct)"];

function formatDate(d) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("fr-CA", {
      weekday: "long", day: "numeric", month: "long",
    });
  } catch {
    return d;
  }
}

export default function BookingModal({ doctor, initialDate, initialTime, onClose, onBooked }) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(initialDate);
  const [timeSlot, setTimeSlot] = useState(initialTime);
  const [type, setType] = useState(doctor.teleconsultation ? "cabinet" : "cabinet");
  const [motif, setMotif] = useState(MOTIFS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    permit_type: PERMITS[0],
    insurer: INSURERS[0],
    policy_number: "",
  });

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      setForm((f) => ({
        ...f,
        patient_name: data.name || "",
        patient_email: data.email || "",
        patient_phone: data.phone || "",
        permit_type: data.permit_type || PERMITS[0],
        insurer: data.insurer || INSURERS[0],
        policy_number: data.policy_number || "",
      }));
    }).catch(() => {});
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/appointments", {
        doctor_id: doctor.id,
        date,
        time: timeSlot,
        motif,
        type,
        ...form,
      });
      setConfirmation(data);
      setStep(3);
      onBooked && onBooked(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Une erreur est survenue, veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  }

  const days = doctor.availability || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid="booking-modal-overlay"
      >
        <motion.div
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          data-testid="booking-modal"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 p-5">
            <img src={doctor.photo} alt={doctor.nom} className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-ink-900">{doctor.nom}</h3>
              <p className="text-sm text-teal-600">{doctor.specialty}</p>
            </div>
            <button onClick={onClose} data-testid="booking-close-btn" className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>

          {step !== 3 && (
            <div className="flex items-center gap-2 px-5 pt-4 text-xs font-semibold">
              <span className={step >= 1 ? "text-brand-500" : "text-slate-400"}>1. Créneau</span>
              <div className="h-px flex-1 bg-slate-200" />
              <span className={step >= 2 ? "text-brand-500" : "text-slate-400"}>2. Vos informations</span>
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-slate-400">3. Confirmation</span>
            </div>
          )}

          <div className="p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h4 className="mb-2 font-display font-bold text-ink-900">Motif de consultation</h4>
                  <Select value={motif} onChange={(e) => setMotif(e.target.value)} data-testid="booking-motif-select">
                    {MOTIFS.map((m) => <option key={m}>{m}</option>)}
                  </Select>
                </div>

                {doctor.teleconsultation && (
                  <div>
                    <h4 className="mb-2 font-display font-bold text-ink-900">Type de rendez-vous</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setType("cabinet")}
                        data-testid="booking-type-cabinet"
                        className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors ${type === "cabinet" ? "border-brand-500 bg-brand-50 text-brand-500" : "border-slate-200 text-ink-700"}`}
                      >
                        <Building2 size={18} /> Au cabinet
                      </button>
                      <button
                        onClick={() => setType("teleconsultation")}
                        data-testid="booking-type-tele"
                        className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors ${type === "teleconsultation" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-ink-700"}`}
                      >
                        <Video size={18} /> Téléconsultation
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 font-display font-bold text-ink-900">Choisir un créneau</h4>
                  <div className="mb-3 flex gap-1.5 overflow-x-auto hide-scrollbar">
                    {days.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => { setDate(d.date); setTimeSlot(null); }}
                        className={`min-w-[72px] rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition-colors ${date === d.date ? "border-brand-500 bg-brand-50 text-brand-500" : "border-slate-200 text-ink-500"}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {(days.find((d) => d.date === date)?.slots || []).map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setTimeSlot(s.time)}
                        data-testid={`booking-slot-${s.time}`}
                        className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                          !s.available
                            ? "cursor-not-allowed bg-slate-50 text-slate-300 line-through"
                            : timeSlot === s.time
                            ? "bg-brand-500 text-white"
                            : "border border-slate-200 text-brand-500 hover:bg-brand-50"
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={!date || !timeSlot}
                  onClick={() => setStep(2)}
                  data-testid="booking-next-btn"
                >
                  Continuer <ChevronRight size={18} />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                  <span>Ce médecin accueille les patients sans carte RAMQ. Vos informations restent confidentielles.</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom complet">
                    <Input value={form.patient_name} onChange={update("patient_name")} data-testid="booking-name-input" placeholder="Votre nom" />
                  </Field>
                  <Field label="Courriel">
                    <Input type="email" value={form.patient_email} onChange={update("patient_email")} data-testid="booking-email-input" placeholder="vous@exemple.com" />
                  </Field>
                  <Field label="Téléphone">
                    <Input value={form.patient_phone} onChange={update("patient_phone")} data-testid="booking-phone-input" placeholder="+1 514 000 0000" />
                  </Field>
                  <Field label="Statut au Québec">
                    <Select value={form.permit_type} onChange={update("permit_type")} data-testid="booking-permit-select">
                      {PERMITS.map((p) => <option key={p}>{p}</option>)}
                    </Select>
                  </Field>
                  <Field label="Assureur">
                    <Select value={form.insurer} onChange={update("insurer")} data-testid="booking-insurer-select">
                      {INSURERS.map((i) => <option key={i}>{i}</option>)}
                    </Select>
                  </Field>
                  <Field label="Numéro de police">
                    <Input value={form.policy_number} onChange={update("policy_number")} data-testid="booking-policy-input" placeholder="Facultatif" />
                  </Field>
                </div>

                {error && <p className="text-sm font-semibold text-rose-600" data-testid="booking-error">{error}</p>}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)} data-testid="booking-back-btn">
                    <ChevronLeft size={18} /> Retour
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={saving || !form.patient_name || !form.patient_email}
                    onClick={submit}
                    data-testid="confirm-appointment-button"
                  >
                    {saving ? "Confirmation en cours..." : "Confirmer le rendez-vous"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && confirmation && (
              <div className="text-center" data-testid="booking-confirmation">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-600"
                >
                  <CheckCircle2 size={36} />
                </motion.div>
                <h3 className="mt-4 font-display text-xl font-extrabold text-ink-900">Rendez-vous confirmé</h3>
                <p className="mt-1 text-sm text-ink-500">Un récapitulatif a été préparé pour vous.</p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                    <img src={doctor.photo} alt={doctor.nom} className="h-11 w-11 rounded-xl object-cover" />
                    <div>
                      <p className="font-display font-bold text-ink-900">{doctor.nom}</p>
                      <p className="text-sm text-teal-600">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-ink-700">
                    <p className="flex items-center gap-2"><Calendar size={16} className="text-brand-500" /> <span className="capitalize">{formatDate(confirmation.date)}</span></p>
                    <p className="flex items-center gap-2"><Clock size={16} className="text-brand-500" /> {confirmation.time}</p>
                    <p className="flex items-center gap-2">
                      {confirmation.type === "teleconsultation" ? <Video size={16} className="text-brand-500" /> : <MapPin size={16} className="text-brand-500" />}
                      {confirmation.type === "teleconsultation" ? "Téléconsultation en ligne" : confirmation.address}
                    </p>
                    <p className="flex items-center gap-2"><User size={16} className="text-brand-500" /> {confirmation.motif}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <Badge tone="emerald"><CheckCircle2 size={13} /> Confirmé</Badge>
                    <span className="text-sm font-bold text-ink-900">{confirmation.price} $ CA</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button variant="ghost" className="flex-1" onClick={() => window.print()} data-testid="booking-download-btn">
                    <Download size={17} /> Récapitulatif
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={onClose} data-testid="booking-done-btn">
                    Terminer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
