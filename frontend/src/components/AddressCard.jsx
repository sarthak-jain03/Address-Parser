import { useState } from 'react';
import { addressAPI } from '../api';

function AddressCard({ address, onUpdate, onDelete }) {
  var [editing, setEditing] = useState(false);
  var [form, setForm] = useState({ ...address });
  var [saving, setSaving] = useState(false);

  function getStatusLabel(status) {
    if (status === 'parsed') return 'Parsed';
    if (status === 'unparseable') return 'Unparseable';
    return 'Needs Review';
  }

  function getStatusStyle(status) {
    if (status === 'parsed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'unparseable') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value || null });
  }

  async function handleSave() {
    setSaving(true);
    try {
      var res = await addressAPI.update(address._id, {
        house: form.house, street: form.street, locality: form.locality,
        city: form.city, state: form.state, pincode: form.pincode,
        status: form.status, confidence: form.confidence, notes: form.notes
      });
      if (onUpdate) onUpdate(res.data.data);
      setEditing(false);
    } catch (err) {
      alert('Failed to save modifications');
    }
    setSaving(false);
  }

  function handleCancel() {
    setForm({ ...address });
    setEditing(false);
  }

  var fields = [
    { key: 'house', label: 'House / Building' },
    { key: 'street', label: 'Street' },
    { key: 'locality', label: 'Locality' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'PIN Code' }
  ];

  function getStatusAccentBorder(status) {
    if (status === 'parsed') return 'border-l-emerald-500';
    if (status === 'unparseable') return 'border-l-rose-500';
    return 'border-l-amber-500';
  }

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${getStatusAccentBorder(address.status)} rounded-xl p-5 sm:p-6 mb-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <p className="text-xs font-mono text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80 flex-1">
          {address.raw_address}
        </p>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-md border self-start sm:self-center ${getStatusStyle(address.status)}`}>
          {getStatusLabel(address.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        {fields.map(function (f) {
          return (
            <div key={f.key} className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{f.label}</p>
              {editing ? (
                <input
                  type="text"
                  value={form[f.key] || ''}
                  onChange={function (e) { handleChange(f.key, e.target.value); }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className={address[f.key] ? 'font-medium text-slate-900 text-sm' : 'text-slate-300 italic'}>
                  {address[f.key] || '-'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={function (e) { handleChange('status', e.target.value); }}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
            >
              <option value="parsed">Parsed</option>
              <option value="needs_review">Needs Review</option>
              <option value="unparseable">Unparseable</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes || ''}
              onChange={function (e) { handleChange('notes', e.target.value); }}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>
        </div>
      )}

      {address.notes && !editing && (
        <p className="mt-3.5 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
          <span className="font-semibold text-amber-900">Note:</span> {address.notes}
        </p>
      )}

      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
        {editing ? (
          <>
            <button onClick={handleCancel}
              className="px-7 py-2.5 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200 font-bold min-w-[100px] transition-colors border border-slate-200/80">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-2.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold min-w-[130px] transition-colors shadow-sm">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button onClick={function () { setEditing(true); }}
              className="px-7 py-2.5 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200 font-bold min-w-[100px] transition-colors border border-slate-200/80 shadow-2xs">
              Edit
            </button>
            {onDelete && (
              <button onClick={function () { onDelete(address._id); }}
                className="px-7 py-2.5 text-rose-600 bg-rose-50 text-xs rounded-lg hover:bg-rose-100 font-bold min-w-[100px] transition-colors border border-rose-200/80">
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AddressCard;
