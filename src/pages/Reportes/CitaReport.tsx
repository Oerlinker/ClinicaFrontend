import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import API from "../../services/api";
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";
import {
    Table, TableHeader, TableRow,
    TableHead, TableBody, TableCell
} from "../../components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import {format, parseISO} from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    tipo: string;
    paciente: { nombre: string; apellido: string };
    doctor: { usuario: { nombre: string; apellido: string } };
    precio: number;
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

const CitaReport: React.FC = () => {
    const [filter, setFilter] = useState<Filter>({});
    const [enabled, setEnabled] = useState(false);

    const {data: citas = [], isFetching} = useQuery<Cita[]>({
        queryKey: ["citas-report", filter],
        queryFn: () =>
            API.post<Cita[]>("/reportes/citas", {
                doctorId: filter.doctorId ? Number(filter.doctorId) : undefined,
                fechaDesde: filter.fechaDesde,
                fechaHasta: filter.fechaHasta,
            }).then(r => r.data),
        enabled,
    });

    const {data: doctores = []} = useQuery<Doctor[]>({
        queryKey: ["citas-report-doctores"],
        queryFn: () =>
            API.get<Doctor[]>("/empleados/doctores").then(r => r.data),
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {id, value} = e.target;
        setFilter(prev => ({...prev, [id]: value || undefined}));
    };

    const exportToExcel = (rows: Cita[], filename: string) => {
        const sheet = XLSX.utils.json_to_sheet(
            rows.map(cita => ({
                ID: cita.id,
                Fecha: format(parseISO(cita.fecha), 'dd/MM/yyyy'),
                Hora: cita.hora.slice(11, 16),
                Paciente: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
                Doctor: `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`,
                Tipo: cita.tipo,
                Estado: cita.estado,
                Precio: cita.precio,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Citas");
        XLSX.writeFile(wb, filename + ".xlsx");
    };

    const exportToPDF = (rows: Cita[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [['ID', 'Fecha', 'Hora', 'Paciente', 'Doctor', 'Tipo', 'Estado', 'Precio']],
            body: rows.map(cita => [
                cita.id,
                format(parseISO(cita.fecha), 'dd/MM/yyyy'),
                cita.hora.slice(11, 16),
                `${cita.paciente.nombre} ${cita.paciente.apellido}`,
                `${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}`,
                cita.tipo,
                cita.estado,
                cita.precio,
            ]),
        });
        doc.save(filename + ".pdf");
    };

    const exportToHTML = (rows: Cita[], filename: string) => {
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Citas</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Reporte de Citas</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Doctor</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
        `;


        rows.forEach(cita => {
            htmlContent += `
                <tr>
                    <td>${cita.id}</td>
                    <td>${format(parseISO(cita.fecha), 'dd/MM/yyyy')}</td>
                    <td>${cita.hora.slice(11, 16)}</td>
                    <td>${cita.paciente.nombre} ${cita.paciente.apellido}</td>
                    <td>${cita.doctor.usuario.nombre} ${cita.doctor.usuario.apellido}</td>
                    <td>${cita.tipo}</td>
                    <td>${cita.estado}</td>
                    <td>$${cita.precio}</td>
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

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reporte de Citas</CardTitle>
                    <CardDescription>
                        Genera un reporte de citas filtrado por fecha y doctor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <Label htmlFor="fechaDesde">Desde</Label>
                            <Input id="fechaDesde" type="date" onChange={handleChange}/>
                        </div>
                        <div>
                            <Label htmlFor="fechaHasta">Hasta</Label>
                            <Input id="fechaHasta" type="date" onChange={handleChange}/>
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

                    {citas.length > 0 ? (
                        <div className="overflow-x-auto">
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
                                    {citas.map(cita => (
                                        <TableRow key={cita.id}>
                                            <TableCell>{format(parseISO(cita.fecha), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{cita.hora.slice(11, 16)}</TableCell>
                                            <TableCell>{cita.paciente.nombre} {cita.paciente.apellido}</TableCell>
                                            <TableCell>{cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}</TableCell>
                                            <TableCell>{cita.tipo}</TableCell>
                                            <TableCell>{cita.estado}</TableCell>
                                            <TableCell>${cita.precio}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p>No hay citas para mostrar con los filtros seleccionados.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={() => exportToExcel(citas, "reporte_citas")}>Exportar a Excel</Button>
                    <Button onClick={() => exportToPDF(citas, "reporte_citas")}>Exportar a PDF</Button>
                    <Button onClick={() => exportToHTML(citas, "reporte_citas")}>Exportar a HTML</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CitaReport;
