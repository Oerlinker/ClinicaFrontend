import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Table, TableHeader, TableRow,
    TableHead, TableBody, TableCell
} from "../../components/ui/table";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Disponibilidad {
    id: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    duracionSlot: number;
    cupos: number;
    empleado: { usuario: { nombre: string; apellido: string } };
}

interface Doctor {
    id: number;
    usuario: { nombre: string; apellido: string };
}

interface Filter {
    doctorId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}

const DisponibilidadReport: React.FC = () => {
    const [filter, setFilter] = useState<Filter>({});
    const [enabled, setEnabled] = useState(false);


    const { data: doctores = [] } = useQuery<Doctor[]>({
        queryKey: ["disp-report-doctores"],
        queryFn: () =>
            API.get<Doctor[]>("/empleados/doctores").then(r => r.data),
    });


    const { data: filas = [], isFetching } = useQuery<Disponibilidad[]>({
        queryKey: ["disp-report", filter],
        queryFn: () =>
            API.post<Disponibilidad[]>("/reportes/disponibilidades", {
                doctorId: filter.doctorId ? Number(filter.doctorId) : undefined,
                fechaDesde: filter.fechaDesde,
                fechaHasta: filter.fechaHasta,
            }).then(r => r.data),
        enabled,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { id, value } = e.target;
        setFilter(prev => ({ ...prev, [id]: value || undefined }));
    };

    const exportToExcel = (rows: Disponibilidad[], filename: string) => {
        const sheet = XLSX.utils.json_to_sheet(
            rows.map(d => ({
                Fecha: d.fecha || '',
                Inicio: d.horaInicio || '',
                Fin: d.horaFin || '',
                Duración: d.duracionSlot || 0,
                Cupos: d.cupos || 0,
                Doctor: d.empleado && d.empleado.usuario
                    ? `${d.empleado.usuario.nombre || ''} ${d.empleado.usuario.apellido || ''}`
                    : 'No asignado'
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Disponibilidades");
        XLSX.writeFile(wb, filename + ".xlsx");
    };

    const exportToPDF = (rows: Disponibilidad[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [['Fecha', 'Inicio', 'Fin', 'Duración', 'Cupos', 'Doctor']],
            body: rows.map(d => [
                d.fecha || '',
                d.horaInicio || '',
                d.horaFin || '',
                d.duracionSlot || 0,
                d.cupos || 0,
                d.empleado && d.empleado.usuario
                    ? `${d.empleado.usuario.nombre || ''} ${d.empleado.usuario.apellido || ''}`
                    : 'No asignado'
            ]),
        });
        doc.save(filename + ".pdf");
    };

    const exportToHTML = (rows: Disponibilidad[], filename: string) => {
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Disponibilidades</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Reporte de Disponibilidades</h1>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Duración</th>
                        <th>Cupos</th>
                        <th>Doctor</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rows.forEach(d => {
            const doctorNombre = d.empleado && d.empleado.usuario
                ? `${d.empleado.usuario.nombre || ''} ${d.empleado.usuario.apellido || ''}`
                : 'No asignado';

            htmlContent += `
                <tr>
                    <td>${d.fecha || ''}</td>
                    <td>${d.horaInicio || ''}</td>
                    <td>${d.horaFin || ''}</td>
                    <td>${d.duracionSlot || 0}</td>
                    <td>${d.cupos || 0}</td>
                    <td>${doctorNombre}</td>
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reporte de Disponibilidades</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <Label htmlFor="fechaDesde">Desde</Label>
                    <Input id="fechaDesde" type="date" onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="fechaHasta">Hasta</Label>
                    <Input id="fechaHasta" type="date" onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="doctorId">Doctor</Label>
                    <select
                        id="doctorId"
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    >
                        <option value="">— Todos —</option>
                        {doctores.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.usuario.nombre} {d.usuario.apellido}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Button onClick={() => setEnabled(true)} className="mb-4">
                Generar Reporte
            </Button>

            {isFetching && <p>Cargando...</p>}

            {filas && (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Inicio</TableHead>
                                <TableHead>Fin</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead>Cupos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filas.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.fecha}</TableCell>
                                    <TableCell>{d.horaInicio}</TableCell>
                                    <TableCell>{d.horaFin}</TableCell>
                                    <TableCell>{d.duracionSlot}</TableCell>
                                    <TableCell>{d.cupos}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex gap-2">
                        <Button onClick={() => exportToExcel(filas, "Reporte_Disponibilidades")}>
                            Exportar a Excel
                        </Button>
                        <Button onClick={() => exportToPDF(filas, "Reporte_Disponibilidades")}>
                            Exportar a PDF
                        </Button>
                        <Button onClick={() => exportToHTML(filas, "Reporte_Disponibilidades")}>
                            Exportar a HTML
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DisponibilidadReport;
