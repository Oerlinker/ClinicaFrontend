import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
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
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    paciente: { nombre: string; apellido: string };
}

const DoctorAppointments: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [citas, setCitas] = useState<Cita[]>([]);

    const [hasTriajeMap, setHasTriajeMap] = useState<Record<number, boolean>>({});

    const { data, isLoading, error, refetch } = useQuery<Cita[]>({
        queryKey: ["citas-doctor"],
        queryFn: () => API.get("/citas/mis-citas-doctor").then(r => r.data),
    });


    useEffect(() => {
        if (data) {
            const today = new Date();
            setCitas(
                data.filter(cita => parseISO(cita.fecha) >= today)
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
        } catch (err: any) {
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
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Hubo un error al cancelar la cita.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>Cargando citas…</div>;
    if (error)     return <div>Error al cargar citas</div>;

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
                                <TableCell className="flex items-center space-x-2">
                                    {cita.estado !== "CANCELADA" && cita.estado !== "REALIZADA" ? (
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
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setCitas(prev => prev.filter(c => c.id !== cita.id))
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {/* Sólo mostrar si ya hay un triaje registrado */}
                                    {hasTriajeMap[cita.id] && (
                                        <Link to={`/triaje/ver/${cita.id}`}>
                                            <Button variant="secondary" size="sm">
                                                Ver Triaje
                                            </Button>
                                        </Link>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default DoctorAppointments;
