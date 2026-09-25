import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, ShieldCheck, Video, Star, ChevronRight, BadgeCheck, Navigation } from "lucide-react";
import { Badge } from "./ui";

function SlotGrid({ availability, onPick }) {
  const [dayIdx, setDayIdx] = useState(0);
  const day = availability[dayIdx];
  const slots = (day?.slots || []).filter((s) => s.available).slice(0, 8);

  return (
    <div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto hide-scrollbar">
        {availability.map((d, i) => {
          const count = d.slots.filter((s) => s.available).length;
          return (
            <button
              key={d.date}
              onClick={() => setDayIdx(i)}
              data-testid={`slot-day-tab-${i}`}
              className={`flex min-w-[64px] flex-col items-center rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                i === dayIdx
                  ? "border-brand-500 bg-brand-50 text-brand-500"
                  : "border-slate-200 text-ink-500 hover:border-slate-300"
              }`}
            >
              <span className="font-semibold capitalize">{d.label.split(" ").slice(0, 2).join(" ")}</span>
              <span className={count ? "text-teal-600" : "text-slate-300"}>{count} dispo</span>
            </button>
          );
        })}
      </div>
      {slots.length ? (
        <div className="grid grid-cols-4 gap-2">
          {slots.map((s) => (
            <button
              key={s.time}
              onClick={() => onPick(day.date, s.time)}
              data-testid={`slot-btn-${day.date}-${s.time}`}
              className="rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-brand-500 transition-[transform,background-color,border-color] duration-200 hover:border-brand-500 hover:bg-brand-50 active:scale-95"
            >
              {s.time}
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 py-4 text-center text-sm text-ink-500">
          Aucune disponibilité ce jour, essayez une autre date.
        </p>
      )}
    </div>
  );
}

export default function DoctorCard({ doctor, index = 0, onBook, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
      data-testid={`doctor-card-${doctor.id}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 gap-4">
          <button onClick={() => onOpen(doctor)} className="shrink-0">
            <img
              src={doctor.photo}
              alt={doctor.nom}
              className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200 sm:h-28 sm:w-28"
            />
          </button>
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onOpen(doctor)}
              className="text-left"
              data-testid={`doctor-name-${doctor.id}`}
            >
              <h3 className="font-display text-lg font-bold text-ink-900 hover:text-brand-500">
                {doctor.nom}
              </h3>
            </button>
            <p className="text-sm font-semibold text-teal-600">{doctor.specialty}</p>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-ink-900">{doctor.rating.toFixed(1)}</span>
              <span>({doctor.reviews_count} avis)</span>
            </div>

            <div className="mt-2 space-y-1 text-sm text-ink-500">
              <p className="flex items-start gap-1.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <span>{doctor.address}</span>
              </p>
              {doctor.distance_km != null && (
                <p className="flex items-center gap-1.5 font-semibold text-brand-500" data-testid={`doctor-distance-${doctor.id}`}>
                  <Navigation size={14} className="shrink-0" />
                  <span>À {doctor.distance_km.toLocaleString("fr-CA")} km de vous</span>
                </p>
              )}
              <p className="flex items-center gap-1.5">
                <Globe size={15} className="shrink-0 text-slate-400" />
                <span>{doctor.languages.join(", ")}</span>
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {doctor.license?.status === "Actif" && (
                <Badge tone="emerald" title={`Permis ${doctor.license.number}, ${doctor.license.registry}`} data-testid={`doctor-license-badge-${doctor.id}`}>
                  <BadgeCheck size={13} /> Permis CMQ vérifié
                </Badge>
              )}
              {doctor.accepts_without_ramq && (
                <Badge tone="teal">
                  <ShieldCheck size={13} /> Accepte sans RAMQ
                </Badge>
              )}
              {doctor.teleconsultation && (
                <Badge tone="blue">
                  <Video size={13} /> Téléconsultation
                </Badge>
              )}
              <Badge tone="slate">Dès {doctor.price} $ CA</Badge>
            </div>
          </div>
        </div>

        <div className="min-w-0 border-t border-slate-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-900">Prochaines disponibilités</span>
          </div>
          <SlotGrid
            availability={doctor.availability}
            onPick={(date, time) => onBook(doctor, date, time)}
          />
          <button
            onClick={() => onOpen(doctor)}
            data-testid={`doctor-profile-btn-${doctor.id}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:gap-2"
          >
            Voir le profil complet <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
