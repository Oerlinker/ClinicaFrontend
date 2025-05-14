import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { X } from "lucide-react";
import { format, parseISO, startOfDay } from "date-fns";
import RegistrarAtencion from "./RegistrarAtencion";

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    paciente: { id: number; nombre: string; apellido: string };
    empleado: { id: number };
}

const DoctorAppointments: React.FC = () => {
    const { toast } = useToast();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [hasTriajeMap, setHasTriajeMap] = useState<Record<number, boolean>>({});
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);

    const { data, isLoading, error, refetch } = useQuery<Cita[]>({
        queryKey: ["citas-doctor"],
        queryFn: () => API.get("/citas/mis-citas-doctor").then(r => r.data),
    });

    useEffect(() => {
        if (data) {
            const today = startOfDay(new Date());
            setCitas(
                data.filter(cita =>
                    startOfDay(parseISO(cita.fecha)) >= today &&
                    cita.estado === "AGENDADA"
                )
            );
        }
    }, [data]);

    useEffect(() => {
        async function checkTriajes() {
            const map: Record<number, boolean> = {};
            await Promise.all(
                citas.map(async cita => {
                    try {
                        await API.get(`/triajes/cita/${cita.id}`);
                        map[cita.id] = true;
                    } catch {
                        map[cita.id] = false;
                    }
                })
            );
            setHasTriajeMap(map);
        }
        if (citas.length) checkTriajes();
    }, [citas]);

    const marcarRealizada = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/realizar`);
            refetch();
            toast({
                title: "Cita marcada como realizada",
                description: "La cita ha sido marcada como realizada exitosamente.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Hubo un error al marcar la cita como realizada.",
                variant: "destructive",
            });
        }
    };

    const cancelar = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/cancelar-doctor`);
            refetch();
            toast({
                title: "Cita cancelada",
                description: "La cita ha sido cancelada exitosamente.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Hubo un error al cancelar la cita.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>Cargando citas…</div>;
    if (error) return <div>Error al cargar citas</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-4">Citas Asignadas</h2>
            <div className="overflow-x-auto bg-white rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {citas.map(cita => (
                            <TableRow key={cita.id}>
                                <TableCell>
                                    {format(parseISO(cita.fecha), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>{cita.hora.slice(11, 16)}</TableCell>
                                <TableCell>
                                    {cita.paciente.nombre} {cita.paciente.apellido}
                                </TableCell>
                                <TableCell>{cita.estado}</TableCell>
                                <TableCell className="flex flex-wrap gap-2 items-center">
                                    {cita.estado !== "CANCELADA" && cita.estado !== "REALIZADA" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => marcarRealizada(cita.id)}
                                            >
                                                Marcar Realizada
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => cancelar(cita.id)}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    )}

                                    {hasTriajeMap[cita.id] && (
                                        <>
                                            <Link to={`/triaje/ver/${cita.id}`}>
                                                <Button variant="secondary" size="sm">
                                                    Ver Triaje
                                                </Button>
                                            </Link>
                                            {cita.empleado?.id && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => setSelectedCita(cita)}
                                                >
                                                    Registrar Atención
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedCita && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl">
                        <RegistrarAtencion
                            citaId={selectedCita.id}
                            doctorId={selectedCita.empleado.id}
                            pacienteId={selectedCita.paciente.id}
                            onClose={() => {
                                setSelectedCita(null);
                                refetch();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments;
