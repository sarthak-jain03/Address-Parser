import { useState, useEffect, useCallback } from 'react';
import { addressAPI } from '../api';
import AddressCard from '../components/AddressCard';

function AddressList() {
  var [addresses, setAddresses] = useState([]);
  var [loading, setLoading] = useState(true);
  var [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  var [statusFilter, setStatusFilter] = useState('');
  var [searchInput, setSearchInput] = useState('');
  var [search, setSearch] = useState('');

  var fetchAddresses = useCallback(function () {
    setLoading(true);
    var params = { page: pagination.page, limit: pagination.limit };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;

    addressAPI.getAll(params)
      .then(function (res) {
        setAddresses(res.data.data);
        setPagination(function (prev) { return { ...prev, ...res.data.pagination }; });
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, [pagination.page, pagination.limit, statusFilter, search]);

  useEffect(function () {
    fetchAddresses();
  }, [fetchAddresses]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(function (prev) { return { ...prev, page: 1 }; });
  }

  function handleStatusChange(status) {
    setStatusFilter(status);
    setPagination(function (prev) { return { ...prev, page: 1 }; });
  }

  function handleUpdate(updated) {
    setAddresses(addresses.map(function (a) { return a._id === updated._id ? updated : a; }));
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this address record?')) return;
    addressAPI.delete(id)
      .then(function () { fetchAddresses(); })
      .catch(function () { alert('Failed to delete'); });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">All Addresses</h1>
        <p className="text-xs text-slate-500 mt-0.5">Browse and manage parsed address records</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={function (e) { setSearchInput(e.target.value); }}
            placeholder="Search raw text, city, locality..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
          />
          <button type="submit"
            className="px-7 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors min-w-[120px] shadow-sm">
            Search
          </button>
          {search && (
            <button type="button" onClick={function () { setSearch(''); setSearchInput(''); }}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors min-w-[100px] border border-slate-200">
              Clear
            </button>
          )}
        </form>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: '', label: 'All' },
            { id: 'parsed', label: 'Parsed' },
            { id: 'needs_review', label: 'Needs Review' },
            { id: 'unparseable', label: 'Unparseable' }
          ].map(function (tab) {
            var active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={function () { handleStatusChange(tab.id); }}
                className={'px-5 py-2.5 rounded-lg text-xs transition-all font-bold ' +
                  (active ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 py-10">Loading records...</p>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center text-slate-400 text-xs shadow-xs">
          No matching records found.
        </div>
      ) : (
        <div>
          <div className="space-y-6">
            {addresses.map(function (addr) {
              return <AddressCard key={addr._id} address={addr} onUpdate={handleUpdate} onDelete={handleDelete} />;
            })}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-3">
                <button
                  onClick={function () { setPagination(function (prev) { return { ...prev, page: prev.page - 1 }; }); }}
                  disabled={pagination.page <= 1}
                  className="px-8 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 disabled:opacity-40 min-w-[120px] transition-colors border border-slate-200/80"
                >
                  Previous
                </button>
                <button
                  onClick={function () { setPagination(function (prev) { return { ...prev, page: prev.page + 1 }; }); }}
                  disabled={pagination.page >= pagination.pages}
                  className="px-8 py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 disabled:opacity-40 min-w-[120px] transition-colors border border-slate-200/80"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressList;
