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
} from "../components/ui/table";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Button} from "../components/ui/button";
import {format, parseISO} from "date-fns";
import {useToast} from "../hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Bitacora {
    id: number;
    usuario: { id: number };
    fecha: string;
    accion: string;
    ip: string;
}

const AdminBitacora: React.FC = () => {
    const [userId, setUserId] = useState<string>("");
    const [desde, setDesde] = useState<string>("");   // yyyy-MM-dd
    const [hasta, setHasta] = useState<string>("");
    const [bitacoras, setBitacoras] = useState<Bitacora[]>([]);
    const {toast} = useToast();

    const {data, isLoading, error, refetch} = useQuery({
        queryKey: ["bitacoras", userId, desde, hasta],
        queryFn: async () => {

            let url = "/bitacoras";
            if (userId && desde && hasta) {
                url = `/bitacoras/usuario/${userId}/fecha?desde=${desde}&hasta=${hasta}`;
            } else if (userId) {
                url = `/bitacoras/usuario/${userId}`;
            } else if (desde && hasta) {
                url = `/bitacoras/fecha?desde=${desde}&hasta=${hasta}`;
            }
            const res = await API.get<Bitacora[]>(url);
            return res.data;
        },

        enabled: true,
    });


    useEffect(() => {
        if (data) setBitacoras(data);
    }, [data]);

    const handleSearch = () => {

        refetch();
    };

    const exportToExcel = (rows: Bitacora[], filename: string) => {
        const sheet = XLSX.utils.json_to_sheet(
            rows.map((b) => ({
                ID: b.id,
                "Usuario ID": b.usuario.id,
                Fecha: format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss"),
                IP: b.ip || 'N/A',
                Acción: b.accion,
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, "Bitácora");
        XLSX.writeFile(wb, filename + ".xlsx");
    };

    const exportToPDF = (rows: Bitacora[], filename: string) => {
        const doc = new jsPDF();
        (doc as any).autoTable({
            head: [["ID", "Usuario ID", "Fecha", "Acción"]],
            body: rows.map((b) => [
                b.id,
                b.usuario.id,
                format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss"),
                b.ip || 'N/A',
                b.accion,
            ]),
        });
        doc.save(filename + ".pdf");
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

                    <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        {/* Filtrar por Usuario */}
                        <div className="flex flex-col">
                            <Label htmlFor="userId">ID de Usuario</Label>
                            <Input
                                type="number"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="ID del usuario"
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="desde">Desde</Label>
                            <Input
                                type="date"
                                id="desde"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <Label htmlFor="hasta">Hasta</Label>
                            <Input
                                type="date"
                                id="hasta"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                            />
                        </div>

                        <div className="flex space-x-2">
                            <Button onClick={handleSearch}>Buscar</Button>
                            <Button onClick={() => exportToExcel(bitacoras, "bitacora")}>
                                Exportar Excel
                            </Button>
                            <Button onClick={() => exportToPDF(bitacoras, "bitacora")}>
                                Exportar PDF
                            </Button>
                        </div>
                    </div>


                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Usuario ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bitacoras.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell>{b.id}</TableCell>
                                        <TableCell>{b.usuario.id}</TableCell>
                                        <TableCell>
                                            {format(parseISO(b.fecha), "dd/MM/yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>{b.ip || 'N/A'}</TableCell>
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
