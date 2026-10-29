import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import LoginScreen from '@/components/LoginScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Eager: Dashboard is the landing page — load immediately
import Dashboard from './pages/Dashboard';

// Lazy: all other pages load on-demand
const LiveBoard = lazy(() => import('./pages/LiveBoard'));
const VehicleBoard = lazy(() => import('./pages/VehicleBoard'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const VehicleTimeline = lazy(() => import('./pages/VehicleTimeline'));
const Tasks = lazy(() => import('./pages/Tasks'));
const QualityControl = lazy(() => import('./pages/QualityControl'));
const TaeubertStandard = lazy(() => import('./pages/TaeubertStandard'));
const HandoverMode = lazy(() => import('./pages/HandoverMode'));
const ErrorDatabase = lazy(() => import('./pages/ErrorDatabase'));
const MoodBarometer = lazy(() => import('./pages/MoodBarometer'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const AISchadenAnalyse = lazy(() => import('./pages/AISchadenAnalyse'));
const Team = lazy(() => import('./pages/Team'));
const SOPLibrary = lazy(() => import('./pages/SOPLibrary'));
const TimeTracking = lazy(() => import('./pages/TimeTracking'));
const Performance = lazy(() => import('./pages/Performance'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const CRM = lazy(() => import('./pages/CRM'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Materials = lazy(() => import('./pages/Materials'));
const Clothing = lazy(() => import('./pages/Clothing'));
const Academy = lazy(() => import('./pages/Academy'));
const TyrStorage = lazy(() => import('./pages/TyrStorage'));
const KPIDashboard = lazy(() => import('./pages/KPIDashboard'));
const DATImport = lazy(() => import('./pages/DATImport'));
const Auftragsverteilung = lazy(() => import('./pages/Auftragsverteilung'));
const ChecklistRunner = lazy(() => import('./pages/ChecklistRunner'));
const VehicleHistory = lazy(() => import('./pages/VehicleHistory'));
const Nachkalkulation = lazy(() => import('./pages/Nachkalkulation'));
const WerkstattControl = lazy(() => import('./pages/WerkstattControl'));
const Tagesstart = lazy(() => import('./pages/Tagesstart'));
const NachtragInbox = lazy(() => import('./pages/NachtragInbox'));
const CustomerJourney = lazy(() => import('./pages/CustomerJourney'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const DataImport = lazy(() => import('./pages/DataImport'));
const PerformanceHub = lazy(() => import('./pages/PerformanceHub'));
const MeinTag = lazy(() => import('./pages/MeinTag'));
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const ChefAnsicht = lazy(() => import('./pages/ChefAnsicht'));
const SchadenAufnahme = lazy(() => import('./pages/SchadenAufnahme'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Schichtplan = lazy(() => import('./pages/Schichtplan'));
const Berechtigungen = lazy(() => import('./pages/Berechtigungen'));
const ChefCockpit = lazy(() => import('./pages/ChefCockpit'));
const PersonalDashboard = lazy(() => import('./pages/PersonalDashboard'));
const Ausbildungsplan = lazy(() => import('./pages/Ausbildungsplan'));
const Aufgabeneinplanung = lazy(() => import('./pages/Aufgabeneinplanung'));
const LiveDashboard = lazy(() => import('./pages/LiveDashboard'));
const ZeitBoard = lazy(() => import('./pages/ZeitBoard'));
const ZeitKorrektur = lazy(() => import('./pages/ZeitKorrektur'));
const Monatsauswertung = lazy(() => import('./pages/Monatsauswertung'));
const Schadenkalkulation = lazy(() => import('./pages/Schadenkalkulation'));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-xl text-foreground tracking-widest mb-4">TÄUBERT</h1>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ProtectedRoute path="/"><Dashboard /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute path="/live"><Suspense fallback={<PageLoader />}><LiveBoard /></Suspense></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute path="/vehicles"><Suspense fallback={<PageLoader />}><VehicleBoard /></Suspense></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute path="/vehicles/:id"><Suspense fallback={<PageLoader />}><VehicleDetail /></Suspense></ProtectedRoute>} />
        <Route path="/vehicles/:id/timeline" element={<ProtectedRoute path="/vehicles/:id/timeline"><Suspense fallback={<PageLoader />}><VehicleTimeline /></Suspense></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute path="/tasks"><Suspense fallback={<PageLoader />}><Tasks /></Suspense></ProtectedRoute>} />
        <Route path="/quality" element={<ProtectedRoute path="/quality"><Suspense fallback={<PageLoader />}><QualityControl /></Suspense></ProtectedRoute>} />
        <Route path="/standard" element={<ProtectedRoute path="/standard"><Suspense fallback={<PageLoader />}><TaeubertStandard /></Suspense></ProtectedRoute>} />
        <Route path="/handover" element={<ProtectedRoute path="/handover"><Suspense fallback={<PageLoader />}><HandoverMode /></Suspense></ProtectedRoute>} />
        <Route path="/errors" element={<ProtectedRoute path="/errors"><Suspense fallback={<PageLoader />}><ErrorDatabase /></Suspense></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute path="/mood"><Suspense fallback={<PageLoader />}><MoodBarometer /></Suspense></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute path="/ai-assistant"><Suspense fallback={<PageLoader />}><AIAssistant /></Suspense></ProtectedRoute>} />
        <Route path="/ai-analyse" element={<ProtectedRoute path="/ai-analyse"><Suspense fallback={<PageLoader />}><AISchadenAnalyse /></Suspense></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute path="/team"><Suspense fallback={<PageLoader />}><Team /></Suspense></ProtectedRoute>} />
        <Route path="/sop" element={<ProtectedRoute path="/sop"><Suspense fallback={<PageLoader />}><SOPLibrary /></Suspense></ProtectedRoute>} />
        <Route path="/timetracking" element={<ProtectedRoute path="/timetracking"><Suspense fallback={<PageLoader />}><TimeTracking /></Suspense></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute path="/performance"><Suspense fallback={<PageLoader />}><Performance /></Suspense></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute path="/leave"><Suspense fallback={<PageLoader />}><LeaveManagement /></Suspense></ProtectedRoute>} />
        <Route path="/crm" element={<ProtectedRoute path="/crm"><Suspense fallback={<PageLoader />}><CRM /></Suspense></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute path="/calendar"><Suspense fallback={<PageLoader />}><Calendar /></Suspense></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute path="/materials"><Suspense fallback={<PageLoader />}><Materials /></Suspense></ProtectedRoute>} />
        <Route path="/clothing" element={<ProtectedRoute path="/clothing"><Suspense fallback={<PageLoader />}><Clothing /></Suspense></ProtectedRoute>} />
        <Route path="/academy" element={<ProtectedRoute path="/academy"><Suspense fallback={<PageLoader />}><Academy /></Suspense></ProtectedRoute>} />
        <Route path="/tyres" element={<ProtectedRoute path="/tyres"><Suspense fallback={<PageLoader />}><TyrStorage /></Suspense></ProtectedRoute>} />
        <Route path="/kpi" element={<ProtectedRoute path="/kpi"><Suspense fallback={<PageLoader />}><KPIDashboard /></Suspense></ProtectedRoute>} />
        <Route path="/dat-import" element={<ProtectedRoute path="/dat-import"><Suspense fallback={<PageLoader />}><DATImport /></Suspense></ProtectedRoute>} />
        <Route path="/auftragsverteilung" element={<ProtectedRoute path="/auftragsverteilung"><Suspense fallback={<PageLoader />}><Auftragsverteilung /></Suspense></ProtectedRoute>} />
        <Route path="/checklisten" element={<ProtectedRoute path="/checklisten"><Suspense fallback={<PageLoader />}><ChecklistRunner /></Suspense></ProtectedRoute>} />
        <Route path="/vehicle-history" element={<ProtectedRoute path="/vehicle-history"><Suspense fallback={<PageLoader />}><VehicleHistory /></Suspense></ProtectedRoute>} />
        <Route path="/nachkalkulation" element={<ProtectedRoute path="/nachkalkulation"><Suspense fallback={<PageLoader />}><Nachkalkulation /></Suspense></ProtectedRoute>} />
        <Route path="/werkstatt" element={<ProtectedRoute path="/werkstatt"><Suspense fallback={<PageLoader />}><WerkstattControl /></Suspense></ProtectedRoute>} />
        <Route path="/tagesstart" element={<ProtectedRoute path="/tagesstart"><Suspense fallback={<PageLoader />}><Tagesstart /></Suspense></ProtectedRoute>} />
        <Route path="/nachtraege" element={<ProtectedRoute path="/nachtraege"><Suspense fallback={<PageLoader />}><NachtragInbox /></Suspense></ProtectedRoute>} />
        <Route path="/customer-journey" element={<ProtectedRoute path="/customer-journey"><Suspense fallback={<PageLoader />}><CustomerJourney /></Suspense></ProtectedRoute>} />
        <Route path="/portal" element={<ProtectedRoute path="/portal"><Suspense fallback={<PageLoader />}><CustomerPortal /></Suspense></ProtectedRoute>} />
        <Route path="/data-import" element={<ProtectedRoute path="/data-import"><Suspense fallback={<PageLoader />}><DataImport /></Suspense></ProtectedRoute>} />
        <Route path="/performance-hub" element={<ProtectedRoute path="/performance-hub"><Suspense fallback={<PageLoader />}><PerformanceHub /></Suspense></ProtectedRoute>} />
        <Route path="/mein-tag" element={<ProtectedRoute path="/mein-tag"><Suspense fallback={<PageLoader />}><MeinTag /></Suspense></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute path="/employees"><Suspense fallback={<PageLoader />}><EmployeeManagement /></Suspense></ProtectedRoute>} />
        <Route path="/chef" element={<ProtectedRoute path="/chef"><Suspense fallback={<PageLoader />}><ChefAnsicht /></Suspense></ProtectedRoute>} />
        <Route path="/schadenaufnahme" element={<ProtectedRoute path="/schadenaufnahme"><Suspense fallback={<PageLoader />}><SchadenAufnahme /></Suspense></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute path="/onboarding"><Suspense fallback={<PageLoader />}><Onboarding /></Suspense></ProtectedRoute>} />
        <Route path="/schichtplan" element={<ProtectedRoute path="/schichtplan"><Suspense fallback={<PageLoader />}><Schichtplan /></Suspense></ProtectedRoute>} />
        <Route path="/berechtigungen" element={<ProtectedRoute path="/berechtigungen"><Suspense fallback={<PageLoader />}><Berechtigungen /></Suspense></ProtectedRoute>} />
        <Route path="/cockpit" element={<ProtectedRoute path="/cockpit"><Suspense fallback={<PageLoader />}><ChefCockpit /></Suspense></ProtectedRoute>} />
        <Route path="/mein-dashboard" element={<ProtectedRoute path="/mein-dashboard"><Suspense fallback={<PageLoader />}><PersonalDashboard /></Suspense></ProtectedRoute>} />
        <Route path="/ausbildungsplan" element={<ProtectedRoute path="/ausbildungsplan"><Suspense fallback={<PageLoader />}><Ausbildungsplan /></Suspense></ProtectedRoute>} />
        <Route path="/aufgabeneinplanung" element={<ProtectedRoute path="/aufgabeneinplanung"><Suspense fallback={<PageLoader />}><Aufgabeneinplanung /></Suspense></ProtectedRoute>} />
        <Route path="/live-dashboard" element={<ProtectedRoute path="/live-dashboard"><Suspense fallback={<PageLoader />}><LiveDashboard /></Suspense></ProtectedRoute>} />
        <Route path="/zeit-board" element={<ProtectedRoute path="/zeit-board"><Suspense fallback={<PageLoader />}><ZeitBoard /></Suspense></ProtectedRoute>} />
        <Route path="/zeit-korrektur" element={<ProtectedRoute path="/zeit-korrektur"><Suspense fallback={<PageLoader />}><ZeitKorrektur /></Suspense></ProtectedRoute>} />
        <Route path="/monatsauswertung" element={<ProtectedRoute path="/monatsauswertung"><Suspense fallback={<PageLoader />}><Monatsauswertung /></Suspense></ProtectedRoute>} />
        <Route path="/schadenkalkulation" element={<ProtectedRoute path="/schadenkalkulation"><Suspense fallback={<PageLoader />}><Schadenkalkulation /></Suspense></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App