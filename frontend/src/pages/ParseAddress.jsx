import { useState } from 'react';
import { addressAPI } from '../api';
import AddressCard from '../components/AddressCard';

var SAMPLE_ADDRESSES = [
  'Flat 302, Tower B, Prestige Lakeside, Whitefield, Bangalore 560066',
  'H.No. 45, Sector 21, Noida, UP 201301',
  'B-2/403, Vasant Kunj, New Delhi',
  'near big temple, opp SBI ATM, Malviya Nagar',
  'टावर A, फ्लैट 12, सेक्टर 62, नोएडा 201309',
  'WeWork Galaxy, 43 Residency Rd, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025',
  'Sector 21, Gurgaon, Haryana 122016',
  '23, 2nd Cross, 5th Main, Koramangala 5th Block, Bangalore - 110001',
  'c/o Rahul Verma, 14 MG Road, Pune 411001',
  'The address is my office on the 3rd floor, I\'ll come down to collect',
  '7GQ8+3M Noida, Uttar Pradesh',
  'Flat 4A, Sunshine Apts, Bombay 400053',
  'Plot 15, DLF Phase 3, Nathupur, Gurugram — 122002 (gate code: 4455#)',
  '#42, 1st Floor, 100 Feet Road, Indiranagar, BLR 560038',
  'same as last time'
];

function ParseAddress() {
  var [input, setInput] = useState('');
  var [results, setResults] = useState([]);
  var [parsing, setParsing] = useState(false);
  var [progress, setProgress] = useState({ current: 0, total: 0 });

  function loadSamples() {
    setInput(SAMPLE_ADDRESSES.join('\n'));
  }

  async function handleParse() {
    var lines = input.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
    if (lines.length === 0) return;

    setParsing(true);
    setResults([]);
    setProgress({ current: 0, total: lines.length });

    var newResults = [];
    for (var i = 0; i < lines.length; i++) {
      setProgress({ current: i + 1, total: lines.length });
      try {
        var res = await addressAPI.parse(lines[i]);
        newResults.push(res.data.data);
      } catch (err) {
        newResults.push({
          _id: 'error-' + i,
          raw_address: lines[i],
          status: 'unparseable',
          confidence: 'low',
          notes: 'Error: ' + err.message
        });
      }
      setResults([...newResults]);
    }
    setParsing(false);
  }

  function handleUpdate(updated) {
    setResults(results.map(function (r) { return r._id === updated._id ? updated : r; }));
  }

  var parsedCount = results.filter(function (r) { return r.status === 'parsed'; }).length;
  var reviewCount = results.filter(function (r) { return r.status === 'needs_review'; }).length;
  var failedCount = results.filter(function (r) { return r.status === 'unparseable'; }).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Parse Addresses</h1>
        <p className="text-xs text-slate-500 mt-0.5">Parse raw address strings using AI</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Enter raw addresses (one per line)</p>
          <button onClick={loadSamples}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors border border-blue-200/80 shadow-2xs">
            Load 15 test samples
          </button>
        </div>

        <textarea
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          placeholder="Flat 302, Tower B, Whitefield, Bangalore 560066"
          className="w-full h-48 px-4 py-3 border border-slate-300 rounded-xl text-xs font-mono resize-none focus:outline-none focus:border-blue-500 bg-slate-50/50"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-500">
            <span className="font-bold text-slate-800">{input.split('\n').filter(function (l) { return l.trim(); }).length}</span> address(es) queued
          </p>
          <div className="flex gap-4">
            <button onClick={function () { setInput(''); setResults([]); }}
              disabled={parsing}
              className="px-8 py-3.5 text-sm text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 font-bold min-w-[120px] transition-colors border border-slate-200/60">
              Clear
            </button>
            <button onClick={handleParse}
              disabled={parsing || !input.trim()}
              className="px-10 py-3.5 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold transition-all min-w-[200px] shadow-md hover:shadow-lg active:scale-[0.99]">
              {parsing ? 'Parsing ' + progress.current + '/' + progress.total + '...' : 'Parse Addresses'}
            </button>
          </div>
        </div>
      </div>

      {parsing && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
            <span>Parsing batch...</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-blue-600 transition-all duration-200"
              style={{ width: (progress.current / progress.total * 100) + '%' }} />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-6 flex gap-3 text-xs">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold shadow-xs">
            {parsedCount} Parsed
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold shadow-xs">
            {reviewCount} Needs Review
          </span>
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold shadow-xs">
            {failedCount} Unparseable
          </span>
        </div>
      )}

      <div className="space-y-6">
        {results.map(function (addr, i) {
          return <AddressCard key={addr._id || i} address={addr} onUpdate={handleUpdate} />;
        })}
      </div>
    </div>
  );
}

export default ParseAddress;
