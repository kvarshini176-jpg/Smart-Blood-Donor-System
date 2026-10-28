import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { HowItWorks } from './pages/public/HowItWorks';
import { Login } from './pages/public/Login';
import { RegisterDonor } from './pages/public/RegisterDonor';
import { RegisterHospital } from './pages/public/RegisterHospital';
import { Contact } from './pages/public/Contact';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorProfile } from './pages/donor/DonorProfile';
import { AvailableRequests } from './pages/donor/AvailableRequests';
import { DonationHistory } from './pages/donor/DonationHistory';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { HospitalProfile } from './pages/hospital/HospitalProfile';
import { CreateBloodRequest } from './pages/hospital/CreateBloodRequest';
import { ManageRequests } from './pages/hospital/ManageRequests';
import { CompatibleDonors } from './pages/hospital/CompatibleDonors';
import { InterestedDonors } from './pages/hospital/InterestedDonors';
import { DonationTracking } from './pages/hospital/DonationTracking';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HospitalVerifications } from './pages/admin/HospitalVerifications';
import { ManageDonors } from './pages/admin/ManageDonors';
import { ManageHospitals } from './pages/admin/ManageHospitals';
import { ManageBloodRequests } from './pages/admin/ManageBloodRequests';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register-donor" element={<RegisterDonor />} />
                <Route path="/register-hospital" element={<RegisterHospital />} />
                <Route path="/contact" element={<Contact />} />

                {/* Donor Protected Routes */}
                <Route
                  path="/donor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/profile"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonorProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/requests"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <AvailableRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/history"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonationHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Hospital Protected Routes */}
                <Route
                  path="/hospital/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/profile"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <HospitalProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/create-request"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <CreateBloodRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <ManageRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests/:id/compatible-donors"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <CompatibleDonors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests/:id/responses"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <InterestedDonors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/donations"
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <DonationTracking />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <HospitalVerifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/donors"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ManageDonors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/hospitals"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ManageHospitals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/requests"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ManageBloodRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
