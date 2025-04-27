import {Toaster} from "./components/ui/toaster";
import {Toaster as Sonner} from "./components/ui/sonner";
import {TooltipProvider} from "./components/ui/tooltip";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route, useParams} from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import {AuthProvider} from "./contexts/AuthContext";
import UserDashboard from "./pages/UserDashboard";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Appointment from "./pages/Appointment";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import NoPermissionPage from './pages/NoPermissionPage';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster/>
            <Sonner/>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/Appointment" element={<Appointment/>}/>
                        <Route path="/payment/:citaId/:pacienteId/:amount/:currency" element={<PaymentRoute/>}/>
                        <Route path="/pago-exitoso" element={<PaymentSuccessPage />} />
                        <Route path="/no-permission" element={<NoPermissionPage />} />
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <UserDashboard/>
                            </PrivateRoute>}/>
                        <Route path="/admin-dashboard" element={
                            <PrivateRoute>
                                <AdminDashboard/>
                            </PrivateRoute>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

function PaymentRoute() {
    const {citaId, pacienteId, amount, currency} = useParams();

    return (
        <PrivateRoute>
            <PaymentPage
                citaId={Number(citaId)}
                pacienteId={Number(pacienteId)}
                amount={Number(amount)}
                currency={currency || "USD"}
            />
        </PrivateRoute>
    );
}

export default App;
