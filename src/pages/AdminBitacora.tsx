import React, {useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import API from "../services/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Input} from "../components/ui/input"
import {Label} from "../components/ui/label"
import {Button} from "../components/ui/button"
import {Calendar} from "../components/ui/calendar"
import {cn} from "../lib/utils"
import {format} from "date-fns"
import {CalendarIcon} from "lucide-react"
import {Popover, PopoverContent, PopoverTrigger} from "../components/ui/popover"
import {DateRange} from "react-day-picker"
import {useToast} from "../hooks/use-toast"
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Bitacora {
    id: number;
    usuarioId: number;
    fecha: string;
    accion: string;
}

const AdminBitacora = () => {
    const [userId, setUserId] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
    const {toast} = useToast()

    const {data, isLoading, error, refetch} = useQuery({
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
                const response = await API.get(url);
                return response.data;
            } catch (err: any) {
                toast({
                    title: "Error!",
                    description: "Hubo un error al obtener las bitacoras",
                    variant: "destructive",
                })
                throw err;
            }
        },
        enabled: false,
    });

    useEffect(() => {
        if (data) {
            setBitacoras(data);
        }
    }, [data]);

    const handleSearch = async () => {
        await refetch();
    };

    const exportToExcel = (data: any[], filename: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bitacora');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data: any[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [['ID', 'Usuario ID', 'Fecha', 'Acción']],
            body: data.map(item => [item.id, item.usuarioId, new Date(item.fecha).toLocaleString(), item.accion]),
        });
        doc.save(`${filename}.pdf`);
    };

    if (isLoading) return <div>Cargando bitácoras...</div>;
    if (error) return <div>Error al cargar bitácoras</div>;

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Bitácora de Actividades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div>
                            <Label htmlFor="userId">ID de Usuario:</Label>
                            <Input
                                type="number"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="ID del usuario"
                            />
                        </div>
                        <div>
                            <Label>Rango de Fechas:</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[300px] justify-start text-left font-normal",
                                            !dateRange?.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                `${format(dateRange.from, "LLL dd, y")} - ${format(
                                                    dateRange.to,
                                                    "LLL dd, y"
                                                )}`
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("2023-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-end space-x-2">
                            <Button onClick={() => handleSearch()}>Buscar</Button>
                            <Button onClick={() => exportToExcel(bitacoras, 'bitacora')}>Exportar a Excel</Button>
                            <Button onClick={() => exportToPDF(bitacoras, 'bitacora')}>Exportar a PDF</Button>
                        </div>
                    </div>
                    <div className="mt-4 overflow-x-auto">
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
                                {bitacoras.map((bitacora) => (
                                    <TableRow key={bitacora.id}>
                                        <TableCell>{bitacora.id}</TableCell>
                                        <TableCell>{bitacora.usuarioId}</TableCell>
                                        <TableCell>{new Date(bitacora.fecha).toLocaleString()}</TableCell>
                                        <TableCell>{bitacora.accion}</TableCell>
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