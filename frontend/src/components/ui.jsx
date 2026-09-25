import React from "react";

export function Badge({ children, tone = "teal", className = "", ...props }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    blue: "bg-brand-50 text-brand-500 border-blue-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-lift px-5 py-3",
    teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm px-5 py-3",
    ghost: "bg-white text-brand-500 border border-slate-200 hover:border-brand-500 hover:bg-brand-50 px-5 py-3",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5",
    danger: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2.5",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-ink-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
      {...props}
    >
      {children}
    </select>
  );
}
