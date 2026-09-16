function StatsCard({ label, value, type }) {
  var badgeColor = "bg-slate-100 text-slate-700";

  if (type === "parsed") {
    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (type === "review") {
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (type === "unparseable") {
    badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (type === "total") {
    badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${badgeColor}`}>
          Metric
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value !== undefined ? value : 0}</p>
    </div>
  );
}

export default StatsCard;
