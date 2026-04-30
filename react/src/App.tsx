import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { useTheme } from './hooks';
import Layout from './components/layout/Layout';
import ToastHost from './components/ui/ToastHost';

import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports      from './pages/Reports';
import Recurring    from './pages/Recurring';
import Planner      from './pages/Planner';
import Chat         from './pages/Chat';
import Onboarding   from './pages/Onboarding';
import Stubs        from './pages/Stubs';

export default function App() {
  const init = useStore(s => s.init);
  const loading = useStore(s => s.loading);
  const profile = useStore(s => s.profile);
  useTheme();

  useEffect(() => { init(); }, [init]);

  // Periodic recurring + notifications check (every 60s while app open)
  const runRecurring = useStore(s => s.runRecurringEngine);
  useEffect(() => {
    const id = setInterval(() => { runRecurring(); }, 60_000);
    return () => clearInterval(id);
  }, [runRecurring]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="display-italic text-3xl text-coral mb-2">FinFlow</div>
          <div className="mono-label">Loading…</div>
        </div>
      </div>
    );
  }

  // First-run gate: route to onboarding if no template assigned
  if (!profile.template && !profile.onboardedAt) {
    return (
      <>
        <Onboarding />
        <ToastHost />
      </>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports"      element={<Reports />} />
        <Route path="/recurring"    element={<Recurring />} />
        <Route path="/planner"      element={<Planner />} />
        <Route path="/chat"         element={<Chat />} />
        <Route path="/budgets"      element={<Stubs page="budgets" />} />
        <Route path="/goals"        element={<Stubs page="goals" />} />
        <Route path="/splits"       element={<Stubs page="splits" />} />
        <Route path="/debts"        element={<Stubs page="debts" />} />
        <Route path="/networth"     element={<Stubs page="networth" />} />
        <Route path="/settings"     element={<Stubs page="settings" />} />
        <Route path="/help"         element={<Stubs page="help" />} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastHost />
    </Layout>
  );
}
