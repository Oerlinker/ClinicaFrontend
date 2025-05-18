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
import DisponibilidadReport from "./Reportes/DisponibilidadReport";
import AdminDepartamentosDashboard from "./AdminDepartamentosDashboard";
import AntecedentesAdmin from "./AntecedentesAdmin";
import {Button} from "../components/ui/button";

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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
                    <Button
                        onClick={() => window.open('/api/backup', '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Descargar Backup
                    </Button>
                </div>
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
                    <AccordionItem value="reportes-disp">
                        <AccordionTrigger>Reportes de Disponibilidades</AccordionTrigger>
                        <AccordionContent>
                            <DisponibilidadReport/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="Disponibilidades">
                        <AccordionTrigger>Disponibilidades</AccordionTrigger>
                        <AccordionContent>
                            <DisponibilidadForm/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="departamentos">
                        <AccordionTrigger>Gestión de Departamentos</AccordionTrigger>
                        <AccordionContent>
                            <AdminDepartamentosDashboard/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="antecedentes">
                        <AccordionTrigger>Gestión de Antecedentes</AccordionTrigger>
                        <AccordionContent>
                            <AntecedentesAdmin/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
};

export default AdminDashboard;
