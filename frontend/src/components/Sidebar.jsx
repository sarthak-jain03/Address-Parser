import { NavLink } from 'react-router-dom';

function Sidebar() {
  var links = [
    { to: '/', label: 'Dashboard' },
    { to: '/parse', label: 'Parse Addresses' },
    { to: '/addresses', label: 'Address Directory' }
  ];

  return (
    <aside className="w-70 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Address Parser</h1>
        </div>

        <p className="text-xs text-slate-500 font-medium">Customer Intelligence System</p>
      </div>

      <nav className="space-y-5 flex-1">
        {links.map(function (link) {
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={function ({ isActive }) {
                return 'block px-4 py-4 rounded-lg text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900');
              }}
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
