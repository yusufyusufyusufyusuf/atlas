import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { BuildPage } from '@/components/FormulaBuilder/BuildPage';
import { RdProjectBoard } from '@/components/RdProjectBoard/RdProjectBoard';
import { cn } from '@/lib/utils';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Quotes', to: '/quotes' },
  { label: 'Formula Builder', to: '/formulas' },
  { label: 'Customers', to: '/customers' },
  { label: 'Customer POs', to: '/customer-pos' },
  { label: 'Raw materials', to: '/raw-materials' },
  { label: 'Finance params', to: '/finance-params' },
  { label: 'Users', to: '/users' },
  { label: 'Audit log', to: '/audit-log' },
];

function TopNav() {
  const location = useLocation();
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-line bg-white px-4 py-0 h-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0 mr-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded text-white text-sm font-bold"
          style={{ backgroundColor: 'hsl(22,90%,52%)' }}
        >
          A
        </div>
        <span className="text-sm font-semibold text-ink leading-tight">
          Atlas <span className="font-normal text-muted">Operating System</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex h-full items-stretch gap-0 overflow-x-auto flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink hover:border-line',
              )}
              style={isActive ? { color: 'hsl(337,62%,32%)', borderColor: 'hsl(337,62%,32%)' } : undefined}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: 'hsl(337,62%,32%)' }}
        >
          ADMIN
        </span>
        <span className="text-xs text-muted">husayn@aurasciences.com</span>
        <button className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[10px] text-muted hover:text-ink">
          Sign out
        </button>
      </div>
    </header>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-muted text-sm">
      {title} — coming soon
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<RdProjectBoard />} />
            <Route path="/rd-projects" element={<RdProjectBoard />} />
            <Route path="/formulas" element={<BuildPage />} />
            <Route path="/formulas/:familyId" element={<BuildPage />} />
            <Route path="/formulas/:familyId/versions/:versionId" element={<BuildPage />} />
            <Route path="/quotes" element={<Placeholder title="Quotes" />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/customer-pos" element={<Placeholder title="Customer POs" />} />
            <Route path="/raw-materials" element={<Placeholder title="Raw Materials" />} />
            <Route path="/finance-params" element={<Placeholder title="Finance Params" />} />
            <Route path="/users" element={<Placeholder title="Users" />} />
            <Route path="/audit-log" element={<Placeholder title="Audit Log" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
