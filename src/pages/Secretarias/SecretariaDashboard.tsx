import React from "react";
import {useAuth} from "../../contexts/AuthContext";
import {Navigate, Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import API from "../../services/api";
import Header from "../../components/Header";
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from "../../components/ui/table";
import DisponibilidadForm from "../DisponibilidadForm";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "../../components/ui/accordion";
import SecretariaAppointment from "./SecretariaAppointment";

type Cita = {
    id: number;
    fecha: string;
    hora: string;
    paciente: { nombre: string; apellido: string };
    doctor: { usuario: { nombre: string; apellido: string } };
    tipo: string;
    estado: string;
    precio: number;
};

const SecretariaDashboard: React.FC = () => {
    const {user} = useAuth();
    const isSecretaria = Boolean(user && user.rol?.nombre === "SECRETARIA");

    const {data: citas = [], isLoading, error} = useQuery<Cita[], Error>({
        queryKey: ["citas-admin"],
        queryFn: () => API.get("/citas").then(r => r.data),
        enabled: isSecretaria,
    });

    if (!isSecretaria) {
        return <Navigate to="/no-permission" replace/>;
    }

    if (isLoading) return <div>Cargando citas…</div>;
    if (error) return <div>Error cargando citas</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Dashboard Secretaria</h1>
                <Accordion type="single" collapsible>
                    <AccordionItem value="citas">
                        <AccordionTrigger>Gestionar Citas</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex justify-between items-center mb-6">
                            </div>
                            <div className="overflow-x-auto bg-white rounded shadow">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Hora</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Precio</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {citas.map(c => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.fecha}</TableCell>
                                                <TableCell>{c.hora.slice(11, 16)}</TableCell>
                                                <TableCell>{c.paciente.nombre} {c.paciente.apellido}</TableCell>
                                                <TableCell>{c.doctor.usuario.nombre} {c.doctor.usuario.apellido}</TableCell>
                                                <TableCell>{c.tipo}</TableCell>
                                                <TableCell>{c.estado}</TableCell>
                                                <TableCell>${c.precio}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="nueva-cita">
                        <AccordionTrigger>Agendar Nueva Cita</AccordionTrigger>
                        <AccordionContent>
                            <SecretariaAppointment/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="disponibilidad">
                        <AccordionTrigger>Gestionar Disponibilidad</AccordionTrigger>
                        <AccordionContent>
                            <DisponibilidadForm/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
};

export default SecretariaDashboard;
