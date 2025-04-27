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
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
                            <Button
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !dateRange?.from && "text-muted-foreground"
                                )}
                                variant={"outline"}
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
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
                            {isCalendarOpen && (
                                <div className="mt-2">
                                    <Calendar
                                        defaultMonth={dateRange?.from}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("2023-01-01")
                                        }
                                        initialFocus
                                        mode="range"
                                        onSelect={setDateRange}
                                        selected={dateRange}
                                        classNames={{
                                            months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
                                            month: "space-y-2",
                                            caption: "flex justify-center pt-1 relative items-center",
                                            caption_label: "text-sm font-medium",
                                            nav: "space-x-1 flex items-center",
                                            nav_button: cn(
                                                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                            ),
                                            nav_button_previous: "absolute left-1",
                                            nav_button_next: "absolute right-1",
                                            table: "w-full border-collapse space-y-1",
                                            head_row: "flex",
                                            head_cell:
                                                "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                            row: "flex w-full mt-2",
                                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                            day: cn(
                                                "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                            ),
                                            day_range_end: "day-range-end",
                                            day_selected:
                                                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                            day_today: "bg-accent text-accent-foreground",
                                            day_outside:
                                                "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                            day_disabled: "text-muted-foreground opacity-50",
                                            day_range_middle:
                                                "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                            day_hidden: "invisible",
                                        }}
                                    />
                                </div>
                            )}
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