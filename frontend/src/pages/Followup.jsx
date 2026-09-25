import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Pill, StickyNote, Receipt, Download, Stethoscope, Calendar, ClipboardList,
} from "lucide-react";
import { Badge } from "../components/ui";
import { toast } from "sonner";
import api from "../lib/api";

function formatDate(d) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("fr-CA", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function Followup() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get("/consultations")
      .then(({ data }) => setItems(data.consultations))
      .catch(() => toast.error("Impossible de charger votre historique."))
      .finally(() => setLoading(false));
  }, []);

  async function downloadReceipt(c) {
    setDownloading(c.id);
    try {
      const { data } = await api.get(`/consultations/${c.id}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu-doclive-${c.date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Reçu téléchargé.");
    } catch {
      toast.error("Le téléchargement du reçu a échoué. Veuillez réessayer.");
    } finally {
      setDownloading(null);
    }
  }

  const totalReceipts = items.reduce((s, c) => s + (c.receipt_amount || 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Historique et suivi médical</h1>
        <p className="mt-1 text-ink-500">Vos consultations, ordonnances et reçus pour remboursement, réunis au même endroit.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Consultations" value={items.length} tone="brand" />
        <StatCard icon={Pill} label="Ordonnances" value={items.filter((c) => c.prescription).length} tone="teal" />
        <StatCard icon={Receipt} label="Reçus assurance" value={`${totalReceipts} $`} tone="emerald" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-ink-900">Aucune consultation enregistrée</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-slate-200" />
          <div className="space-y-6">
            {items.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative"
                data-testid={`consultation-${c.id}`}
              >
                <span className="absolute -left-6 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-500 ring-4 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-brand-500">
                        <Calendar size={15} /> {formatDate(c.date)}
                      </p>
                      <h3 className="mt-1 font-display font-bold text-ink-900">{c.motif}</h3>
                      <p className="flex items-center gap-1.5 text-sm text-teal-600">
                        <Stethoscope size={14} /> {c.doctor_name}, {c.specialty}
                      </p>
                    </div>
                    {c.receipt_available && <Badge tone="emerald"><Receipt size={13} /> Reçu {c.receipt_amount} $</Badge>}
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <Line icon={FileText} title="Diagnostic" text={c.diagnosis} />
                    {c.prescription && <Line icon={Pill} title="Ordonnance" text={c.prescription} tone="teal" />}
                    {c.notes && <Line icon={StickyNote} title="Notes de suivi" text={c.notes} />}
                  </div>

                  {c.receipt_available && (
                    <button
                      onClick={() => downloadReceipt(c)}
                      disabled={downloading === c.id}
                      data-testid={`receipt-download-${c.id}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-[gap] hover:gap-2.5 disabled:opacity-50"
                    >
                      <Download size={15} /> {downloading === c.id ? "Préparation du reçu..." : "Télécharger le reçu pour l'assurance (PDF)"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Line({ icon: Icon, title, text, tone = "slate" }) {
  const bg = tone === "teal" ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-500";
  return (
    <div className="flex gap-3">
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${bg}`}>
        <Icon size={15} />
      </span>
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="text-ink-700">{text}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    brand: "bg-brand-50 text-brand-500",
    teal: "bg-teal-50 text-teal-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></span>
      <div>
        <p className="font-display text-2xl font-extrabold text-ink-900">{value}</p>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}
