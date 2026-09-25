import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Clock, MapPin, Video, Building2, CheckCircle2, XCircle,
  CalendarPlus, User, Ban,
} from "lucide-react";
import { Badge, Button } from "../components/ui";
import { toast } from "sonner";
import api from "../lib/api";

function formatDate(d) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("fr-CA", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return d;
  }
}

function AppointmentCard({ a, onCancel, canceling }) {
  const cancelled = a.status === "CANCELLED";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      data-testid={`appointment-card-${a.id}`}
      className={`rounded-2xl border bg-white p-5 shadow-soft ${cancelled ? "border-slate-200 opacity-70" : "border-slate-200"}`}
    >
      <div className="flex gap-4">
        <img src={a.doctor_photo} alt={a.doctor_name} className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-ink-900">{a.doctor_name}</h3>
              <p className="text-sm font-semibold text-teal-600">{a.specialty}</p>
            </div>
            {cancelled ? (
              <Badge tone="slate"><Ban size={13} /> Annulé</Badge>
            ) : (
              <Badge tone="emerald"><CheckCircle2 size={13} /> Confirmé</Badge>
            )}
          </div>

          <div className="mt-3 grid gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
            <p className="flex items-center gap-2"><Calendar size={15} className="text-brand-500" /> <span className="capitalize">{formatDate(a.date)}</span></p>
            <p className="flex items-center gap-2"><Clock size={15} className="text-brand-500" /> {a.time}</p>
            <p className="flex items-center gap-2">
              {a.type === "teleconsultation" ? <Video size={15} className="text-brand-500" /> : <Building2 size={15} className="text-brand-500" />}
              {a.type === "teleconsultation" ? "Téléconsultation" : a.city}
            </p>
            <p className="flex items-center gap-2"><User size={15} className="text-brand-500" /> {a.motif}</p>
          </div>

          {!cancelled && a.type !== "teleconsultation" && (
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-500"><MapPin size={15} /> {a.address}</p>
          )}

          {!cancelled && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-bold text-ink-900">{a.price} $ CA</span>
              <Button variant="danger" onClick={() => onCancel(a.id)} disabled={canceling === a.id} data-testid={`cancel-appointment-${a.id}`}>
                <XCircle size={16} /> {canceling === a.id ? "Annulation..." : "Annuler"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Appointments() {
  const [data, setData] = useState({ upcoming: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  function load() {
    setLoading(true);
    api.get("/appointments")
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Impossible de charger vos rendez-vous. Vérifiez votre connexion."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
    setCanceling(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success("Rendez-vous annulé.");
      load();
    } catch (err) {
      const msg = err?.response?.data?.detail || "L'annulation a échoué. Veuillez réessayer.";
      toast.error(msg);
    } finally {
      setCanceling(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Mes rendez-vous</h1>
          <p className="mt-1 text-ink-500">Gérez vos consultations à venir et passées.</p>
        </div>
        <Link to="/recherche">
          <Button variant="primary"><CalendarPlus size={17} /> Nouveau</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">À venir</h2>
            {data.upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center" data-testid="no-upcoming">
                <Calendar size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-ink-900">Aucun rendez-vous à venir</p>
                <p className="mt-1 text-sm text-ink-500">Réservez votre première consultation en quelques clics.</p>
                <Link to="/recherche" className="mt-4 inline-block">
                  <Button variant="primary"><CalendarPlus size={17} /> Trouver un médecin</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcoming.map((a) => <AppointmentCard key={a.id} a={a} onCancel={cancel} canceling={canceling} />)}
              </div>
            )}
          </section>

          {data.history.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Historique</h2>
              <div className="space-y-4">
                {data.history.map((a) => <AppointmentCard key={a.id} a={a} onCancel={cancel} canceling={canceling} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
