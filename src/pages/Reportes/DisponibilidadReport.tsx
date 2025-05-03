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
            API.get<Doctor[]>("/api/empleados/doctores").then(r => r.data),
    });


    const { data: filas, isFetching } = useQuery<Disponibilidad[]>({
        queryKey: ["disp-report", filter],
        queryFn: () =>
            API.post<Disponibilidad[]>("/api/reportes/disponibilidades", {
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
            )}
        </div>
    );
};

export default DisponibilidadReport;
