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
import CitaReport from "./pages/Reportes/CitaReport";
import DoctorDashboard from "./pages/Doctores/DoctorDashboard";
import SecretariaDashboard from "./pages/Secretarias/SecretariaDashboard";
import SecretariaAppointment from "./pages/Secretarias/SecretariaAppointment";
import DisponibilidadForm from "./pages/DisponibilidadForm";
import DisponibilidadReport from "./pages/Reportes/DisponibilidadReport";
import RegistroTriaje from "./pages/Enfermeras/RegistroTriaje";
import EnfermeraDashboard from "./pages/Enfermeras/EnfermeraDashboard";
import VerTriaje from "./pages/Doctores/VerTriaje";
import DeptList from "./pages/DeptList";
import DeptForm from "./pages/DeptForm";


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
                        <Route path="/payment/:citaId/:pacienteId/:amount/:currency" element={<PaymentRoute/>}/>
                        <Route path="/pago-exitoso" element={<PaymentSuccessPage/>}/>
                        <Route path="/no-permission" element={<NoPermissionPage/>}/>
                        <Route path="/reportes/citas"
                               element={
                                   <PrivateRoute requiredRole="ADMIN">
                                       <CitaReport/>
                                   </PrivateRoute>}/>
                        <Route
                           path="/reportes/disponibilidades"
                           element={
                             <PrivateRoute requiredRole="ADMIN">
                                  <DisponibilidadReport/>
                                 </PrivateRoute>}/>
                        <Route
                            path="/doctor-dashboard"
                            element={
                                <PrivateRoute requiredRole="DOCTOR">
                                    <DoctorDashboard/>
                                </PrivateRoute>}/>
                        <Route
                            path="/triaje/ver/:citaId"
                            element={
                                <PrivateRoute requiredRole="DOCTOR">
                                    <VerTriaje/>
                                </PrivateRoute>}/>
                        <Route
                            path="/enfermera-dashboard"
                            element={
                                <PrivateRoute requiredRole="ENFERMERA">
                                    <EnfermeraDashboard/>
                                </PrivateRoute>}/>
                        <Route
                            path="/Appointment"
                            element={
                                <PrivateRoute requiredRole="PACIENTE">
                                    <Appointment/>
                                </PrivateRoute>}/>
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute requiredRole="PACIENTE">
                                    <UserDashboard/>
                                </PrivateRoute>}/>
                        <Route
                            path="/secretaria-dashboard"
                            element={
                                <PrivateRoute requiredRole="SECRETARIA">
                                    <SecretariaDashboard/>
                                </PrivateRoute>}/>
                        <Route
                            path="/secretaria-dashboard/nueva-cita"
                            element={
                                <PrivateRoute requiredRole="SECRETARIA">
                                    <SecretariaAppointment/>
                                </PrivateRoute>}/>
                        <Route
                            path="/admin-dashboard"
                            element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <AdminDashboard/>
                                </PrivateRoute>}/>
                        <Route path="*" element={<NotFound/>}/>
                        <Route
                            path="/admin/disponibilidades/nueva"
                            element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <DisponibilidadForm/>
                                </PrivateRoute>}/>
                        <Route
                            path="/secretaria/disponibilidades/nueva"
                            element={
                                <PrivateRoute requiredRole="SECRETARIA">
                                    <DisponibilidadForm/>
                                </PrivateRoute>}/>
                        <Route
                            path="/triaje/:citaId"
                            element={
                                <PrivateRoute requiredRole="ENFERMERA">
                                    <RegistroTriaje/>
                                </PrivateRoute>}/>
                        <Route
                            path="/admin/departamentos"
                            element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <DeptList/>
                                </PrivateRoute>}/>
                        <Route
                            path="/admin/departamentos/nuevo"
                            element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <DeptForm/>
                                </PrivateRoute>}/>
                        <Route
                            path="/admin/departamentos/:id"
                            element={
                                <PrivateRoute requiredRole="ADMIN">
                                    <DeptForm/>
                                </PrivateRoute>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

function PaymentRoute() {
    return (
        <PrivateRoute>
            <PaymentPage/>
        </PrivateRoute>
    );
}


export default App;
