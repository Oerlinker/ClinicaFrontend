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

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    tipo?: string;
    precio: number;
    paciente: { nombre: string; apellido: string };
    doctor: { usuario: { nombre: string; apellido: string } };
}

interface Doctor {
    id: number;
    usuario: { nombre: string; apellido: string };
}

interface Filter {
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: string;
    doctorId?: string;
}

const CitaReport: React.FC = () => {
    const [filter, setFilter] = useState<Filter>({});
    const [enabled, setEnabled] = useState(false);


    const {data: doctores = []} = useQuery<Doctor[]>({
        queryKey: ["report-doctores"],
        queryFn: () => API.get<Doctor[]>("/api/empleados/doctores").then(r => r.data),
    });


    const {data: citas, isFetching} = useQuery<Cita[]>({
        queryKey: ["report-citas", filter],
        queryFn: async () => {
            // Convertimos doctorId a número sólo si existe
            const payload = {
                ...filter,
                doctorId: filter.doctorId ? Number(filter.doctorId) : undefined
            };
            const res = await API.post("/api/reportes/citas", payload);
            return res.data;
        },
        enabled,
    });


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {id, value} = e.target;
        setFilter(prev => ({
            ...prev,
            [id]: value || undefined
        }));
    };

    const runReport = () => setEnabled(true);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reporte de Citas</h2>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <Label htmlFor="fechaDesde">Desde</Label>
                    <Input id="fechaDesde" type="date" onChange={handleChange}/>
                </div>
                <div>
                    <Label htmlFor="fechaHasta">Hasta</Label>
                    <Input id="fechaHasta" type="date" onChange={handleChange}/>
                </div>
                <div>
                    <Label htmlFor="estado">Estado</Label>
                    <select
                        id="estado"
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    >
                        <option value="">— Todos —</option>
                        <option value="AGENDADA">Agendada</option>
                        <option value="REALIZADA">Realizada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
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

            <Button onClick={runReport} className="mb-4">
                Generar Reporte
            </Button>

            {isFetching && <p>Cargando...</p>}

            {citas && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Doctor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {citas.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{c.id}</TableCell>
                                <TableCell>{c.fecha}</TableCell>
                                <TableCell>{c.hora}</TableCell>
                                <TableCell>{c.estado}</TableCell>
                                <TableCell>{c.tipo || "-"}</TableCell>
                                <TableCell>{c.precio}</TableCell>
                                <TableCell>
                                    {c.paciente.nombre} {c.paciente.apellido}
                                </TableCell>
                                <TableCell>
                                    {c.doctor.usuario.nombre} {c.doctor.usuario.apellido}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default CitaReport;
