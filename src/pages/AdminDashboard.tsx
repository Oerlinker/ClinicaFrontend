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
import AdminServiciosDashboard from "./AdminServiciosDashboard";
import AdminPatologiasDashboard from "./AdminPatologiasDashboard";
import AtencionAdmin from "./AtencionAdmin";
import AdminMedicamentosDashboard from "./AdminMedicamentosDashboard";
import AdminTratamientosDashboard from "./AdminTratamientosDashboard";
import {toast} from "../hooks/use-toast";
import {Button} from "../components/ui/button";
import API from "../services/api";


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

    const downloadBackup = async () => {
        try {
            const response = await API.get("/backup", {responseType: "blob"});
            const blob = new Blob([response.data], {type: "application/sql"});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "backup.sql");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            toast({
                title: "Error",
                description: "No se pudo descargar el backup.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
                    <Button
                        onClick={downloadBackup}
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
                    <AccordionItem value="servicios">
                        <AccordionTrigger>Gestión de Servicios</AccordionTrigger>
                        <AccordionContent>
                            <AdminServiciosDashboard/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="patologias">
                        <AccordionTrigger>Gestión de Patologías</AccordionTrigger>
                        <AccordionContent>
                            <AdminPatologiasDashboard/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="medicamentos">
                        <AccordionTrigger>Gestión de Medicamentos</AccordionTrigger>
                        <AccordionContent>
                            <AdminMedicamentosDashboard/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="tratamientos">
                        <AccordionTrigger>Gestión de Tratamientos</AccordionTrigger>
                        <AccordionContent>
                            <AdminTratamientosDashboard/>
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
                    <AccordionItem value="Atencion">
                        <AccordionTrigger>Gestión de Atencion</AccordionTrigger>
                        <AccordionContent>
                            <AtencionAdmin/>
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
