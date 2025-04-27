// src/pages/AdminBitacora.tsx

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../services/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { DateRange } from "react-day-picker";
import { useToast } from "../hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Bitacora {
    id: number;
    usuario: { id: number; username?: string };
    fecha: string;
    accion: string;
}

const AdminBitacora: React.FC = () => {
    const [userId, setUserId] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
    const { toast } = useToast();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["bitacoras", userId, dateRange],
        queryFn: async () => {
            let url = "/bitacoras";
            if (userId && dateRange?.from && dateRange?.to) {
                const desde = format(dateRange.from, "yyyy-MM-dd");
                const hasta = format(dateRange.to, "yyyy-MM-dd");
                url = `/bitacoras/usuario/${userId}/fecha?desde=${desde}&hasta=${hasta}`;
            } else if (userId) {
                url = `/bitacoras/usuario/${userId}`;
            } else if (dateRange?.from && dateRange?.to) {
                const desde = format(dateRange.from, "yyyy-MM-dd");
                const hasta = format(dateRange.to, "yyyy-MM-dd");
                url = `/bitacoras/fecha?desde=${desde}&hasta=${hasta}`;
            }
            try {
                const res = await API.get<Bitacora[]>(url);
                return res.data;
            } catch (err: any) {
                toast({
                    title: "Error al obtener bitácoras",
                    description: err.message,
                    variant: "destructive",
                });
                throw err;
            }
        },
        enabled: false,
    });

    useEffect(() => {
        if (data) setBitacoras(data);
    }, [data]);

    const handleSearch = () => refetch();

    const exportToExcel = (data: Bitacora[], filename: string) => {
        // Convertimos a plain object para Excel
        const sheetData = data.map(b => ({
            ID: b.id,
            "Usuario ID": b.usuario.id,
            Fecha: format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss"),
            Acción: b.accion,
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bitácora");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data: Bitacora[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [["ID", "Usuario ID", "Fecha", "Acción"]],
            body: data.map(b => [
                b.id,
                b.usuario.id,
                format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss"),
                b.accion,
            ]),
        });
        doc.save(`${filename}.pdf`);
    };

    if (isLoading) return <div>Cargando bitácoras…</div>;
    if (error) return <div>Error al cargar bitácoras</div>;

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Bitácora de Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filtros: columna en móvil, fila en desktop */}
                    <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0 mb-6">
                        {/* ID de Usuario */}
                        <div className="flex flex-col">
                            <Label htmlFor="userId">ID de Usuario</Label>
                            <Input
                                type="number"
                                id="userId"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                placeholder="ID del usuario"
                            />
                        </div>
                        {/* Rango de Fechas */}
                        <div className="relative flex flex-col">
                            <Label>Rango de Fechas</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full md:w-64 justify-start text-left font-normal",
                                            !dateRange?.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from
                                            ? dateRange.to
                                                ? `${format(dateRange.from, "dd 'de' MMM yyyy", { locale: es })} – ${format(
                                                    dateRange.to,
                                                    "dd 'de' MMM yyyy",
                                                    { locale: es }
                                                )}`
                                                : format(dateRange.from, "dd 'de' MMM yyyy", { locale: es })
                                            : "Seleccionar fechas"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="bottom" align="start" sideOffset={6} className="w-[260px] p-0">
                                    <Calendar
                                        locale={es}
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        disabled={date => date > new Date() || date < new Date("2023-01-01")}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        {/* Botones */}
                        <div className="flex space-x-2">
                            <Button onClick={handleSearch}>Buscar</Button>
                            <Button onClick={() => exportToExcel(bitacoras, "bitacora")}>Exportar Excel</Button>
                            <Button onClick={() => exportToPDF(bitacoras, "bitacora")}>Exportar PDF</Button>
                        </div>
                    </div>

                    {/* Tabla con scroll horizontal */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Usuario ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bitacoras.map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.id}</TableCell>
                                        <TableCell>{b.usuario.id}</TableCell>
                                        <TableCell>{format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                                        <TableCell>{b.accion}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBitacora;
