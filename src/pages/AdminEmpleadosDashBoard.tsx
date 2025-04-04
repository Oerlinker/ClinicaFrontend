import React, { useState } from "react";
import { Button } from "../components/ui/button";
import EmpleadoSection from "./EmpleadoSection";
import EmpleadoRegister from "./EmpleadoRegisterData"; // Renombrado para mayor claridad

const AdminEmpleadosDashboard: React.FC = () => {

    const [view, setView] = useState<"list" | "register">("list");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Gestión de Empleados</h1>
                <div className="mb-4 flex space-x-4">
                    <Button
                        variant={view === "list" ? "default" : "outline"}
                        onClick={() => setView("list")}
                    >
                        Listado de Empleados
                    </Button>
                    <Button
                        variant={view === "register" ? "default" : "outline"}
                        onClick={() => setView("register")}
                    >
                        Registrar Empleado
                    </Button>
                </div>
                {view === "list" ? <EmpleadoSection /> : <EmpleadoRegister />}
            </div>
        </div>
    );
};

export default AdminEmpleadosDashboard;
