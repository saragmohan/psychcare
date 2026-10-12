import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PaywallModal } from './components/PaywallModal';
import { LoginView } from './views/auth/LoginView';
import { DashboardView } from './views/psychologist/DashboardView';
import { ClientsView } from './views/psychologist/ClientsView';
import { NotesView } from './views/psychologist/NotesView';
import { AssessmentsView } from './views/psychologist/AssessmentsView';
import { AppointmentsView } from './views/psychologist/AppointmentsView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { UserManagementView } from './views/admin/UserManagementView';
import { AuditLogsView } from './views/admin/AuditLogsView';
import { storage } from './services/storageService';
import { authService } from './services/authService';
import type { User } from './types';
import { LayoutDashboard, Users, FileText, Activity, Calendar, History } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>(
    currentUser.role === 'admin' ? 'admin_dashboard' : 'dashboard'
  );
  const userClients = storage.getClients(currentUser.id);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    userClients[0]?.id || ''
  );
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      const u = storage.getCurrentUser();
      setCurrentUser({ ...u });
    });
    return () => unsubscribe();
  }, []);

  // Strict Role-Based Tab Guard
  useEffect(() => {
    if (currentUser.role !== 'admin' && activeTab.startsWith('admin_')) {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, activeTab]);

  useEffect(() => {
    const currentPractitionerClients = storage.getClients(currentUser.id);
    const validClient = currentPractitionerClients.find((c) => c.id === selectedClientId);
    if (!validClient) {
      setSelectedClientId(currentPractitionerClients[0]?.id || '');
    }
  }, [currentUser.id, selectedClientId]);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleLoginSuccess = () => {
    const user = storage.getCurrentUser();
    setCurrentUser({ ...user });
    setIsAuthenticated(true);
    setActiveTab(user.role === 'admin' ? 'admin_dashboard' : 'dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    const user = storage.getCurrentUser();
    setCurrentUser({ ...user });
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans antialiased pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-10 flex-1">
      <Navbar
        currentUser={currentUser}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        {currentUser.role === 'psychologist' && (activeTab === 'dashboard' || activeTab.startsWith('admin_')) && (
          <DashboardView
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onSelectClient={handleSelectClient}
          />
        )}

        {currentUser.role === 'admin' && (activeTab === 'admin_dashboard' || activeTab === 'dashboard') && (
          <AdminDashboardView
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            currentUser={currentUser}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            currentUser={currentUser}
            selectedClientId={selectedClientId}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentsView
            currentUser={currentUser}
            selectedClientId={selectedClientId}
            onOpenPaywall={() => setIsPaywallOpen(true)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectClient={handleSelectClient}
          />
        )}

        {currentUser.role === 'admin' && activeTab === 'admin_users' && <UserManagementView />}

        {currentUser.role === 'admin' && activeTab === 'admin_logs' && <AuditLogsView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {currentUser.role === 'psychologist' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full max-w-full bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] px-1 flex justify-around items-center z-40 shadow-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-0 ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-0 ${
              activeTab === 'clients' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Patients</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-0 ${
              activeTab === 'notes' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-0 ${
              activeTab === 'assessments' ? 'text-teal-400 font-bold bg-teal-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5 shrink-0 text-teal-400" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Tests</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-w-0 ${
              activeTab === 'appointments' ? 'text-indigo-400 font-bold bg-indigo-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Calendar</span>
          </button>
        </nav>
      )}

      {/* Mobile Bottom Navigation Bar for Admin */}
      {currentUser.role === 'admin' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full max-w-full bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] px-2 flex justify-around items-center z-40 shadow-2xl">
          <button
            onClick={() => setActiveTab('admin_dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-0 ${
              activeTab === 'admin_dashboard' || activeTab === 'dashboard' ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('admin_users')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-0 ${
              activeTab === 'admin_users' ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Practitioners</span>
          </button>
          <button
            onClick={() => setActiveTab('admin_logs')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-0 ${
              activeTab === 'admin_logs' ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium mt-0.5 truncate">Audit Logs</span>
          </button>
        </nav>
      )}

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        currentUser={currentUser}
        onUpgradeSuccess={() => {
          alert('🎉 Congratulations! You have unlocked PsychCare Premium Pro.');
        }}
      />
    </div>
  );
}
