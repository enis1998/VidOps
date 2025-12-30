import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import StudioPage from "./pages/StudioPage";
import PublishingPage from "./pages/PublishingPage";
import LibraryPage from "./pages/LibraryPage";
import AccountsPage from "./pages/AccountsPage";
import PricingPage from "./pages/PricingPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Canonical public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* TR -> EN redirects (recommended option A) */}
                <Route path="/giris" element={<Navigate to="/login" replace />} />
                <Route path="/kayit" element={<Navigate to="/register" replace />} />

                {/* App */}
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="studio" element={<StudioPage />} />
                    <Route path="publishing" element={<PublishingPage />} />
                    <Route path="library" element={<LibraryPage />} />
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="pricing" element={<PricingPage />} />

                    {/* TR subpaths -> EN */}
                    <Route path="yayinlama" element={<Navigate to="/app/publishing" replace />} />
                    <Route path="kutuphane" element={<Navigate to="/app/library" replace />} />
                    <Route path="hesaplar" element={<Navigate to="/app/accounts" replace />} />
                    <Route path="paketler" element={<Navigate to="/app/pricing" replace />} />
                </Route>

                <Route path="*" element={<div className="container" style={{ padding: 24 }}>Sayfa bulunamadı</div>} />
            </Routes>
        </BrowserRouter>
    );
}
