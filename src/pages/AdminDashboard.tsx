
import React from "react";
import Header from "../components/Header";
import {useAuth} from "../contexts/AuthContext";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "../components/ui/accordion";
import AdminDashboardContent from "./AdminDashboardContent";
import AdminEmpleadosDashboard from "./AdminEmpleadosDashBoard";
import AdminBitacora from "./AdminBitacora";
import CitaReport from "./Reportes/CitaReport";
import DisponibilidadForm from "./DisponibilidadForm";

const AdminDashboard: React.FC = () => {
    const {user} = useAuth();

    if (!user || !user.rol || user.rol.nombre !== "ADMIN") {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header/>
                <main className="container mx-auto px-4 py-8">
                    <p>No tienes permisos para acceder a este dashboard.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Dashboard de Administración</h1>
                <Accordion type="single" collapsible>
                    <AccordionItem value="roles">
                        <AccordionTrigger>Gestión de Roles</AccordionTrigger>
                        <AccordionContent>
                            <AdminDashboardContent/>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="empleados">
                        <AccordionTrigger>Gestión de Empleados</AccordionTrigger>
                        <AccordionContent>
                            <AdminEmpleadosDashboard/>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="bitacora">
                        <AccordionTrigger>Bitácora</AccordionTrigger>
                        <AccordionContent>
                            <AdminBitacora/>
                        </AccordionContent>
                    </AccordionItem>


                    <AccordionItem value="reportes">
                        <AccordionTrigger>Reportes de Citas</AccordionTrigger>
                        <AccordionContent>
                            <CitaReport/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="Disponibilidades">
                        <AccordionTrigger>Disponibilidades</AccordionTrigger>
                        <AccordionContent>
                            <DisponibilidadForm/>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </main>
        </div>
    );
};

export default AdminDashboard;
