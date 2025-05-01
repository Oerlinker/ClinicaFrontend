
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import DoctorAppointments from "../Doctores/DoctorAppointments";

const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user || !user.rol || user.rol.nombre !== "DOCTOR") {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <p>No tienes permisos para acceder a este dashboard.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Dashboard de Doctor</h1>
                <DoctorAppointments />
            </main>
        </div>
    );
};

export default DoctorDashboard;
