import React, {useState} from "react";
import {Button} from "../components/ui/button";
import ServiciosSection from "./ServiciosSection";
import ServiciosRegister from "./ServiciosRegister";

const AdminServiciosDashboard: React.FC = () => {
    const [view, setView] = useState<"list" | "register">("list");

    const handleRegistrationSuccess = () => {
        setView("list");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Gestión de Servicios</h1>
                <div className="mb-4 flex space-x-4">
                    <Button
                        variant={view === "list" ? "default" : "outline"}
                        onClick={() => setView("list")}
                    >
                        Listado de Servicios
                    </Button>
                    <Button
                        variant={view === "register" ? "default" : "outline"}
                        onClick={() => setView("register")}
                    >
                        Registrar Servicio
                    </Button>
                </div>
                {view === "list" ? (
                    <ServiciosSection />
                ) : (
                    <ServiciosRegister
                        onSuccess={handleRegistrationSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminServiciosDashboard;
