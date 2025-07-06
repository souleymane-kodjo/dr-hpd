// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/Auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PatientPage from './pages/Patient/PatientPage';
import PatientDetailPage from './pages/Patient/PatientDetailPage';
//

import PatientMedicalRecordPage from './pages/Patient/PatientMedicalRecordPage';
import HospitalisationPage from './pages/Hospitalisation/HospitalisationPage';
import PlanifierHospitalisationPage from './pages/Hospitalisation/PlanifierHospitalisationPage';
import GestionLitsPage from './pages/lits/GestionLitsPage';
import AdminRoute from './components/layout/AdminRoute';
import UserManagementPage from './pages/Admin/UserManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques avec le AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Routes privées avec le AppLayout */}
        {/* Plus tard, nous ajouterons une logique pour protéger ces routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} /> {/* Nouvelle route */}
            <Route path="/patients/:patientId/medical-record" element={<PatientMedicalRecordPage />} />
             <Route path="/hospitalisations" element={<HospitalisationPage />} />
             <Route path="/hospitalisations/planifier" element={<PlanifierHospitalisationPage />} />
            <Route path="/lits" element={<GestionLitsPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/utilisateurs" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;