import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import API from '../services/api';
import {Label} from '../components/ui/label';
import {Button} from '../components/ui/button';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";
import {useToast} from '../hooks/use-toast';
import {format, parseISO} from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import tratamientoService, { Tratamiento } from '../services/tratamientoService';



interface Doctor {
    id: number;
    usuario: { nombre: string; apellido: string };
}

interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
}


interface Atencion {
    id: number;
    fecha: string;
    motivo: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    patologia?: string;
    pacienteId: number;
    pacienteNombre: string;
    doctorId: number;
    doctorNombre: string;
}

export default function AtencionAdmin() {
    const {toast} = useToast();
    const [pacienteId, setPacienteId] = useState<string>('');
    const [doctorId, setDoctorId] = useState<string>('');
    const [selectedAtencion, setSelectedAtencion] = useState<Atencion | null>(null);


    const {data: pacientes = [], isLoading: loadingPacientes} = useQuery({
        queryKey: ['pacientes'],
        queryFn: () => API.get<Paciente[]>('/auth/usuarios/pacientes').then(res => res.data)
    });


    const {data: doctores = [], isLoading: loadingDoctores} = useQuery({
        queryKey: ['doctores'],
        queryFn: () => API.get<Doctor[]>('/empleados/doctores').then(res => res.data)
    });


    // Carga Atenciones según filtros
    const {data: atenciones = [], isLoading: loadingAtenciones} = useQuery({
        queryKey: ['atenciones', pacienteId, doctorId],
        queryFn: () => API.post(`/atenciones/paciente/${pacienteId}`, {
            pacienteId: pacienteId ? Number(pacienteId) : undefined,
            doctorId: doctorId ? Number(doctorId) : undefined,
        }).then(res => res.data),
        enabled: !!(pacienteId || doctorId)
    });


    const {data: atencionDetalle, isLoading: loadingDetalle} = useQuery({
        queryKey: ['atencion-detalle', selectedAtencion?.id],
        queryFn: () => API.get(`/atenciones/${selectedAtencion?.id}`).then(res => res.data),
        enabled: !!selectedAtencion
    });

    const {data: tratamientos = [], isLoading: loadingTratamientos} = useQuery({
        queryKey: ['tratamientos-atencion', selectedAtencion?.id],
        queryFn: () => tratamientoService.getTratamientosByAtencion(selectedAtencion!.id).then(res => res.data),
        enabled: !!selectedAtencion
    });

    const handleSelectAtencion = (atencion: Atencion) => {
        setSelectedAtencion(atencion);
    };

    const handleCloseDetalle = () => {
        setSelectedAtencion(null);
    };

    const formatFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString();
    };

    const exportToExcel = (rows: Atencion[], filename: string) => {
        const sheet = XLSX.utils.json_to_sheet(
            rows.map(atencion => ({
                ID: atencion.id,
                Fecha: format(parseISO(atencion.fecha), 'dd/MM/yyyy'),
                Motivo: atencion.motivo,
                Paciente: atencion.pacienteNombre,
                Doctor: atencion.doctorNombre,
                Patologia: atencion.patologia || 'No especificada',
                Diagnóstico: atencion.diagnostico,
                Tratamiento: atencion.tratamiento,
                Observaciones: atencion.observaciones || 'Sin observaciones'
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Atenciones");
        XLSX.writeFile(wb, filename + ".xlsx");
    };


    const exportToPDF = (rows: Atencion[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [['ID', 'Fecha', 'Paciente', 'Doctor', 'Motivo', 'Diagnóstico', 'Tratamiento']],
            body: rows.map(atencion => [
                atencion.id,
                format(parseISO(atencion.fecha), 'dd/MM/yyyy'),
                atencion.pacienteNombre,
                atencion.doctorNombre,
                atencion.motivo,
                atencion.diagnostico,
                atencion.tratamiento
            ]),
        });
        doc.save(filename + ".pdf");
    };


    const exportToHTML = (rows: Atencion[], filename: string) => {
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Atenciones</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Reporte de Atenciones</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Doctor</th>
                        <th>Motivo</th>
                        <th>Diagnóstico</th>
                        <th>Tratamiento</th>
                        <th>Patología</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rows.forEach(atencion => {
            htmlContent += `
                <tr>
                    <td>${atencion.id}</td>
                    <td>${format(parseISO(atencion.fecha), 'dd/MM/yyyy')}</td>
                    <td>${atencion.pacienteNombre}</td>
                    <td>${atencion.doctorNombre}</td>
                    <td>${atencion.motivo}</td>
                    <td>${atencion.diagnostico}</td>
                    <td>${atencion.tratamiento}</td>
                    <td>${atencion.patologia || 'No especificada'}</td>
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([htmlContent], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loadingPacientes || loadingDoctores) return <p>Cargando datos...</p>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Administración de Atenciones</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <Label htmlFor="paciente-select">Paciente</Label>
                    <select
                        id="paciente-select"
                        className="w-full border rounded p-2"
                        value={pacienteId}
                        onChange={e => setPacienteId(e.target.value)}
                    >
                        <option value="">-- Todos los pacientes --</option>
                        {pacientes.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nombre} {p.apellido}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label htmlFor="doctor-select">Doctor</Label>
                    <select
                        id="doctor-select"
                        className="w-full border rounded p-2"
                        value={doctorId}
                        onChange={e => setDoctorId(e.target.value)}
                    >
                        <option value="">-- Todos los doctores --</option>
                        {doctores.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.usuario.nombre} {d.usuario.apellido}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Atenciones */}
            {(pacienteId || doctorId) && (
                <div className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Atenciones Registradas</CardTitle>
                            <CardDescription>
                                {pacienteId && doctorId
                                    ? "Atenciones filtradas por paciente y doctor seleccionados"
                                    : pacienteId
                                        ? "Atenciones del paciente seleccionado"
                                        : "Atenciones del doctor seleccionado"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingAtenciones ? (
                                <p>Cargando atenciones...</p>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Paciente</TableHead>
                                                    <TableHead>Doctor</TableHead>
                                                    <TableHead>Motivo</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {atenciones.length > 0 ? (
                                                    atenciones.map((atencion: Atencion) => (
                                                        <TableRow key={atencion.id}>
                                                            <TableCell>
                                                                {format(parseISO(atencion.fecha), 'dd/MM/yyyy HH:mm')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {atencion.pacienteNombre}
                                                            </TableCell>
                                                            <TableCell>
                                                                {atencion.doctorNombre}
                                                            </TableCell>
                                                            <TableCell>{atencion.motivo}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleSelectAtencion(atencion)}
                                                                >
                                                                    Ver detalles
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center">
                                                            No se encontraron atenciones con los filtros seleccionados
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {atenciones.length > 0 && (
                                        <div className="mt-4 flex gap-2">
                                            <Button onClick={() => exportToExcel(atenciones, "Reporte_Atenciones")}>
                                                Exportar a Excel
                                            </Button>
                                            <Button onClick={() => exportToPDF(atenciones, "Reporte_Atenciones")}>
                                                Exportar a PDF
                                            </Button>
                                            <Button onClick={() => exportToHTML(atenciones, "Reporte_Atenciones")}>
                                                Exportar a HTML
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detalle de la Atención */}
            {selectedAtencion && (
                <div className="mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalle de Atención</CardTitle>
                            <CardDescription>
                                Atención del {format(parseISO(selectedAtencion.fecha), 'dd/MM/yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingDetalle ? (
                                <p>Cargando detalles...</p>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Información General</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <Label>Paciente</Label>
                                                <p className="font-medium">
                                                    {selectedAtencion.pacienteNombre}
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Doctor</Label>
                                                <p className="font-medium">
                                                    {selectedAtencion.doctorNombre}
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Fecha y Hora</Label>
                                                <p className="font-medium">
                                                    {format(parseISO(selectedAtencion.fecha), 'dd/MM/yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">Motivo de Atención</h3>
                                        <p className="mt-1">{selectedAtencion.motivo}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">Diagnóstico</h3>
                                        <p className="mt-1">{selectedAtencion.diagnostico}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">Tratamiento</h3>
                                        <p className="mt-1">{selectedAtencion.tratamiento}</p>
                                    </div>

                                    {selectedAtencion.observaciones && (
                                        <div>
                                            <h3 className="text-lg font-semibold">Observaciones</h3>
                                            <p className="mt-1">{selectedAtencion.observaciones}</p>
                                        </div>
                                    )}

                                    {/* Sección de Tratamientos */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-3">Tratamientos Detallados</h3>

                                        {loadingTratamientos ? (
                                            <p>Cargando tratamientos...</p>
                                        ) : tratamientos.length === 0 ? (
                                            <p className="text-gray-500 italic">No hay tratamientos registrados para esta atención</p>
                                        ) : (
                                            <Accordion type="single" collapsible className="w-full">
                                                {tratamientos.map((tratamiento: Tratamiento) => (
                                                    <AccordionItem key={tratamiento.id} value={`tratamiento-${tratamiento.id}`}>
                                                        <AccordionTrigger className="px-4 py-2 bg-gray-50 hover:bg-gray-100">
                                                            <div className="flex justify-between w-full">
                                                                <span className="font-medium">{tratamiento.nombre}</span>
                                                                <span className="text-sm text-gray-600">
                                                                    {formatFecha(tratamiento.fechaInicio)} - {formatFecha(tratamiento.fechaFin)}
                                                                </span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 py-2">
                                                            <div className="mb-4">
                                                                <p><strong>Descripción:</strong> {tratamiento.descripcion}</p>
                                                                <p><strong>Duración (días):</strong> {tratamiento.duracionDias}</p>
                                                                <p><strong>Fecha Inicio:</strong> {formatFecha(tratamiento.fechaInicio)}</p>
                                                                <p><strong>Fecha Fin:</strong> {formatFecha(tratamiento.fechaFin)}</p>
                                                                {tratamiento.observaciones && (
                                                                    <p><strong>Observaciones:</strong> {tratamiento.observaciones}</p>
                                                                )}
                                                            </div>

                                                            <div className="mt-4">
                                                                <h4 className="font-medium mb-2">Medicamentos del Tratamiento</h4>
                                                                {tratamiento.medicamentosTratamiento &&
                                                                 tratamiento.medicamentosTratamiento.length > 0 ? (
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Medicamento</TableHead>
                                                                                <TableHead>Dosis</TableHead>
                                                                                <TableHead>Frecuencia</TableHead>
                                                                                <TableHead>Duración</TableHead>
                                                                                <TableHead>Vía</TableHead>
                                                                                <TableHead>Instrucciones</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {tratamiento.medicamentosTratamiento.map((med: import('../services/tratamientoService').MedicamentoTratamiento) => (
                                                                                <TableRow key={med.id}>
                                                                                    <TableCell>{med.nombreMedicamento}</TableCell>
                                                                                    <TableCell>{med.dosis} {med.unidadMedida}</TableCell>
                                                                                    <TableCell>{med.frecuencia}</TableCell>
                                                                                    <TableCell>{med.duracionDias} días</TableCell>
                                                                                    <TableCell>{med.viaAdministracion}</TableCell>
                                                                                    <TableCell>{med.instrucciones}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <p className="text-gray-500 italic">No hay medicamentos asignados a este tratamiento</p>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleCloseDetalle}>Cerrar detalles</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
