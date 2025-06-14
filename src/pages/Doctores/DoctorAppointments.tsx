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
import { format, parseISO, startOfDay } from "date-fns";
import AtencionForm from "./AtencionForm";

// Tipos básicos
interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    paciente: { id: number; nombre: string; apellido: string };
    doctor: { id: number };
}
interface Antecedente {
    id: number;
    tipo: string;
    descripcion: string;
    fechaRegistro: string;
}

// Nuevo modelo de Tratamiento y Medicamento en respuesta
interface MedicamentoTratamientoItem {
    id: number;
    medicamentoId: number;
    nombreMedicamento: string;
    dosis: string;
    frecuencia: string;
    duracionDias: number;
    viaAdministracion: string;
    instrucciones?: string;
}

interface Tratamiento {
    id: number;
    nombre: string;
    descripcion: string;
    duracionDias: number;
    fechaInicio: string;
    fechaFin: string;
    observaciones?: string;
    medicamentosTratamiento: MedicamentoTratamientoItem[];
}

interface Atencion {
    id: number;
    fecha: string;
    motivo: string;
    diagnostico: string;
    observaciones?: string;
    patologia?: { id: number; nombre: string; descripcion: string };
    tratamientos: Tratamiento[];
}

interface DoctorVisited {
    usuarioId: number;
    empleadoId: number;
    nombre: string;
    apellido: string;
}

interface HistorialClinicoDTO {
    antecedentes: Antecedente[];
    atenciones: Atencion[];
    citas: Cita[];
    medicosVisitados: DoctorVisited[];
}

const DoctorAppointments: React.FC = () => {
    const { toast } = useToast();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
    const [hasTriajeMap, setHasTriajeMap] = useState<Record<number, boolean>>({});
    const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    // 1) Cargar citas del doctor
    const { data, isLoading, error } = useQuery<Cita[]>({
        queryKey: ["citas-doctor"],
        queryFn: () => API.get("/citas/mis-citas-doctor").then(r => r.data),
    });

    // Filtrar solo agendadas hoy
    useEffect(() => {
        if (data) {
            const hoy = startOfDay(new Date());
            setCitas(
                data.filter(c =>
                    startOfDay(parseISO(c.fecha)).getTime() >= hoy.getTime() &&
                    c.estado === "AGENDADA"
                )
            );
        }
    }, [data]);

    // 2) Verificar si ya existe triaje
    useEffect(() => {
        if (citas.length) {
            Promise.all(
                citas.map(c =>
                    API.get(`/triajes/cita/${c.id}`)
                        .then(() => ({ id: c.id, has: true }))
                        .catch(() => ({ id: c.id, has: false }))
                )
            ).then(res => {
                const map: Record<number, boolean> = {};
                res.forEach(r => (map[r.id] = r.has));
                setHasTriajeMap(map);
            });
        }
    }, [citas]);

    // 3) Cargar historial clínico
    const {
        data: history,
        isLoading: historyLoading,
        error: historyError,
    } = useQuery<HistorialClinicoDTO>({
        queryKey: ["historial", historyPatientId],
        queryFn: () =>
            API.get(`/historial/usuario/${historyPatientId}`).then(r => r.data),
        enabled: historyPatientId !== null,
    });

    // Acciones sobre cita
    const marcarRealizada = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/realizar`);
            setCitas(prev => prev.filter(c => c.id !== id));
            toast({ title: "Cita completada", description: "Marcada como realizada." });
        } catch {
            toast({ title: "Error", description: "No se pudo marcar realizada.", variant: "destructive" });
        }
    };
    const cancelar = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/cancelar-doctor`);
            setCitas(prev => prev.filter(c => c.id !== id));
            toast({ title: "Cita cancelada", description: "Se canceló correctamente." });
        } catch {
            toast({ title: "Error", description: "No se pudo cancelar.", variant: "destructive" });
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
                                <TableCell>{format(parseISO(cita.fecha), "dd/MM/yyyy")}</TableCell>
                                <TableCell>{cita.hora.slice(11, 16)}</TableCell>
                                <TableCell>{cita.paciente.nombre} {cita.paciente.apellido}</TableCell>
                                <TableCell>{cita.estado}</TableCell>
                                <TableCell className="flex flex-wrap gap-2">
                                    {hasTriajeMap[cita.id] && (
                                        <>
                                            <Link to={`/triaje/ver/${cita.id}`}>
                                                <Button size="sm" variant="outline">Ver Triaje</Button>
                                            </Link>
                                            <Button size="sm" onClick={() => setSelectedCita(cita)}>Registrar Atención</Button>
                                        </>
                                    )}
                                    <Button size="sm" onClick={() => marcarRealizada(cita.id)}>Realizada</Button>
                                    <Button size="sm" variant="destructive" onClick={() => cancelar(cita.id)}>Cancelar</Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            setHistoryPatientId(cita.paciente.id);
                                            setShowHistory(true);
                                        }}
                                    >
                                        Ver Historial
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Modal de Atención */}
            {selectedCita && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Registrar Atención</h3>
                            <button onClick={() => setSelectedCita(null)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <AtencionForm citaId={selectedCita.id} onSuccess={() => setSelectedCita(null)} />
                    </div>
                </div>
            )}

            {/* Modal de Historial Clínico */}
            {showHistory && historyPatientId !== null && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start overflow-auto py-8 z-50">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl my-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white pb-2 flex justify-between items-center mb-4 border-b">
                            <h3 className="text-xl font-semibold">Historia Clínica</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        {historyLoading && <p>Cargando historial...</p>}
                        {historyError && <p>Error al cargar historial.</p>}
                        {history && (
                            <div className="space-y-6">
                                {/* Antecedentes */}
                                <section>
                                    <h4 className="font-semibold">Antecedentes</h4>
                                    <ul className="list-disc pl-5">
                                        {history.antecedentes.map(a => (
                                            <li key={a.id}>
                                                {a.tipo}: {a.descripcion} ({format(parseISO(a.fechaRegistro), "dd/MM/yyyy")})
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Atenciones */}
                                <section>
                                    <h4 className="font-semibold">Atenciones</h4>
                                    <ul className="list-disc pl-5">
                                        {history.atenciones.map(at => (
                                            <li key={at.id} className="mb-2">
                                                <strong>{format(parseISO(at.fecha), "dd/MM/yyyy")}</strong>
                                                <p><span className="font-medium">Diagnóstico:</span> {at.diagnostico}</p>
                                                <p><span className="font-medium">Observaciones:</span> {at.observaciones}</p>

                                                <strong>Tratamientos:</strong>
                                                <ul className="list-disc pl-5">
                                                    {at.tratamientos.map(t => (
                                                        <li key={t.id}>
                                                            {t.nombre} ({format(parseISO(t.fechaInicio), "dd/MM/yyyy")} –{" "}
                                                            {format(parseISO(t.fechaFin), "dd/MM/yyyy")})
                                                            <ul className="list-circle pl-5">
                                                                {t.medicamentosTratamiento.map(m => (
                                                                    <li key={m.id}>
                                                                        {m.dosis} de <em>{m.nombreMedicamento}</em>, {m.frecuencia},{" "}
                                                                        {m.duracionDias} días ({m.viaAdministracion})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Citas */}
                                <section>
                                    <h4 className="font-semibold">Citas</h4>
                                    <ul className="list-disc pl-5">
                                        {history.citas.map(c => (
                                            <li key={c.id}>
                                                {format(parseISO(c.fecha), "dd/MM/yyyy")} {c.hora.slice(11, 16)} – {c.estado}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                {/* Médicos Visita
                */}
                                <section>
                                    <h4 className="font-semibold">Médicos Visitados</h4>
                                    <ul className="list-disc pl-5">
                                        {history.medicosVisitados.map(mv => (
                                            <li key={mv.empleadoId}>{mv.nombre} {mv.apellido}</li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorAppointments;
