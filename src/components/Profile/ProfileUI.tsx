import React from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black transition-all ${
      active
        ? "bg-red-600 text-white shadow-lg"
        : "bg-white text-slate-400 hover:bg-red-50 shadow-sm"
    }`}
  >
    {icon} {label}
  </button>
);

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => (
  <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-100">
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-xl bg-red-50 p-2.5 text-red-600">{icon}</div>
      <h3 className="text-lg font-black">{title}</h3>
    </div>
    {children}
  </div>
);

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className="text-xs font-black text-slate-700">{value}</span>
  </div>
);

export const LoadingScreen = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center bg-white gap-4">
    <div className="h-12 w-12 animate-spin rounded-2xl border-[5px] border-red-600 border-t-transparent shadow-xl"></div>
    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600 animate-pulse">
      DANGHOA-ERP SYSTEM
    </p>
  </div>
);
