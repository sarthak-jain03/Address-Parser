import { useState, useEffect } from 'react';
import { addressAPI } from '../api';
import StatsCard from '../components/StatsCard';

function Dashboard() {
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    addressAPI.getStats()
      .then(function (res) { setStats(res.data.data); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500 py-10">Loading statistics...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overview of customer address parsing performance</p>
        </div>
        <a href="/parse" className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-md min-w-[180px] text-center">
          Parse New Addresses
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Processed" value={stats ? stats.total : 0} type="total" />
        <StatsCard label="Parsed" value={stats ? stats.parsed : 0} type="parsed" />
        <StatsCard label="Needs Review" value={stats ? stats.needsReview : 0} type="review" />
        <StatsCard label="Unparseable" value={stats ? stats.unparseable : 0} type="unparseable" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Addresses</h2>
          <a href="/addresses" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            View All
          </a>
        </div>

        {stats && stats.recent && stats.recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50">
                  <th className="px-3 py-2.5">Raw Address</th>
                  <th className="px-3 py-2.5">City</th>
                  <th className="px-3 py-2.5">Locality</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent.map(function (addr) {
                  return (
                    <tr key={addr._id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 font-mono text-slate-800 max-w-xs truncate">
                        {addr.raw_address}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {addr.city || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {addr.locality || '-'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={'px-2 py-0.5 rounded text-[11px] font-medium ' +
                          (addr.status === 'parsed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                           addr.status === 'unparseable' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                           'bg-amber-50 text-amber-700 border border-amber-200')}>
                          {addr.status === 'parsed' ? 'Parsed' : addr.status === 'unparseable' ? 'Unparseable' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No addresses parsed yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
