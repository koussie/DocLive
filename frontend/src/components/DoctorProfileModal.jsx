import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, MapPin, Globe, Star, ShieldCheck, Video, GraduationCap,
  Stethoscope, CheckCircle2, CreditCard,
} from "lucide-react";
import { Badge, Button } from "./ui";

export default function DoctorProfileModal({ doctor, onClose, onBook }) {
  const [dayIdx, setDayIdx] = useState(0);
  const days = doctor.availability || [];
  const day = days[dayIdx];
  const slots = (day?.slots || []).filter((s) => s.available);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-testid="profile-modal-overlay"
      >
        <motion.div
          className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          data-testid="doctor-profile-modal"
        >
          <div className="relative">
            <div className="h-28 bg-gradient-to-r from-brand-500 to-teal-600" />
            <button
              onClick={onClose}
              data-testid="profile-close-btn"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-white/90 text-ink-700 hover:bg-white"
            >
              <X size={20} />
            </button>
            <div className="px-6 pb-2">
              <img
                src={doctor.photo}
                alt={doctor.nom}
                className="-mt-14 h-28 w-28 rounded-2xl object-cover ring-4 ring-white"
              />
              <div className="mt-3">
                <h3 className="font-display text-2xl font-extrabold text-ink-900">{doctor.nom}</h3>
                <p className="font-semibold text-teal-600">{doctor.specialty}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-ink-900">{doctor.rating.toFixed(1)}</span> ({doctor.reviews_count} avis)
                  </span>
                  <span className="flex items-center gap-1.5"><MapPin size={15} /> {doctor.city}</span>
                  <span className="flex items-center gap-1.5"><Globe size={15} /> {doctor.languages.join(", ")}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doctor.accepts_without_ramq && <Badge tone="teal"><ShieldCheck size={13} /> Accepte sans RAMQ</Badge>}
                  {doctor.teleconsultation && <Badge tone="blue"><Video size={13} /> Téléconsultation</Badge>}
                  <Badge tone="slate">Dès {doctor.price} $ CA</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <section>
                <h4 className="mb-2 font-display font-bold text-ink-900">Présentation</h4>
                <p className="text-sm leading-relaxed text-ink-700">{doctor.bio}</p>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-display font-bold text-ink-900">
                  <Stethoscope size={17} className="text-brand-500" /> Actes et consultations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.acts.map((a) => (
                    <span key={a} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-ink-700">{a}</span>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-display font-bold text-ink-900">
                  <GraduationCap size={17} className="text-brand-500" /> Formation
                </h4>
                <ul className="space-y-1.5">
                  {doctor.education.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-ink-700">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-600" /> {e}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-display font-bold text-ink-900">
                  <CreditCard size={17} className="text-brand-500" /> Prise en charge assurances privées
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.insurances.map((i) => (
                    <Badge key={i} tone="emerald">{i}</Badge>
                  ))}
                </div>
                <p className="mt-2 text-sm text-ink-500">
                  Un reçu détaillé est fourni après chaque consultation pour votre remboursement.
                </p>
              </section>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 font-display font-bold text-ink-900">Réserver</h4>
              <div className="mb-3 flex gap-1.5 overflow-x-auto hide-scrollbar">
                {days.map((d, i) => (
                  <button
                    key={d.date}
                    onClick={() => setDayIdx(i)}
                    className={`min-w-[64px] rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${i === dayIdx ? "border-brand-500 bg-white text-brand-500" : "border-slate-200 bg-white text-ink-500"}`}
                  >
                    {d.label.split(" ").slice(0, 2).join(" ")}
                  </button>
                ))}
              </div>
              {slots.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.slice(0, 9).map((s) => (
                    <button
                      key={s.time}
                      onClick={() => onBook(doctor, day.date, s.time)}
                      data-testid={`profile-slot-${s.time}`}
                      className="rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-50"
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-white py-4 text-center text-sm text-ink-500">Aucune disponibilité ce jour.</p>
              )}
              <Button
                variant="primary"
                className="mt-4 w-full"
                onClick={() => day && slots[0] && onBook(doctor, day.date, slots[0].time)}
                disabled={!slots.length}
                data-testid="profile-book-btn"
              >
                Choisir ce créneau
              </Button>
            </aside>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
