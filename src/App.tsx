import { SupplementFactsPage } from '@/components/SupplementFacts/SupplementFactsPage';

const P = 'hsl(337,62%,32%)';

function TopNav() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid hsl(0,0%,90%)', background: '#fff', padding: '0 16px', height: 44, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'hsl(22,90%,52%)', color: '#fff', fontSize: 14, fontWeight: 700 }}>A</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(0,0%,10%)' }}>Atlas <span style={{ fontWeight: 400, color: 'hsl(0,0%,50%)' }}>Operating System</span></span>
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: P, borderRadius: 4, padding: '2px 8px' }}>ADMIN</span>
      <span style={{ fontSize: 12, color: 'hsl(0,0%,50%)' }}>husayn@aurasciences.com</span>
    </header>
  );
}

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <SupplementFactsPage />
      </main>
    </div>
  );
}
