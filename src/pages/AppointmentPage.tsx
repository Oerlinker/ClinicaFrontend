import React, {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import API from '../services/api';
import {useAuth} from '../contexts/AuthContext';
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from '../components/ui/table';
import {Button} from '../components/ui/button';
import {format, parseISO, subWeeks} from 'date-fns';
import {Link} from 'react-router-dom';
import {useToast} from '../hooks/use-toast';

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    tipo: string;
    doctor: { usuario: { nombre: string; apellido: string } };
    precio: number;
}

const AppointmentsPage: React.FC = () => {
    const {user} = useAuth();
    const {toast} = useToast();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [showActionColumn, setShowActionColumn] = useState(true);

    const {data, isLoading, error, refetch} = useQuery<Cita[]>({
        queryKey: ['mis-citas'],
        queryFn: () => API.get('/citas/mis-citas').then(r => r.data),
        enabled: !!user
    });

    useEffect(() => {
        if (data) {
            const today = new Date();
            const oneWeekAgo = subWeeks(today, 1);

            const filteredCitas = data.filter(cita => {
                const citaDate = parseISO(cita.fecha);
                return citaDate >= oneWeekAgo || citaDate > today;
            });

            setCitas(filteredCitas);

            const hasAgendadaCitas = filteredCitas.some(cita => cita.estado === 'AGENDADA');
            setShowActionColumn(hasAgendadaCitas);
        }
    }, [data]);

    const cancelarCita = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/cancelar`);
            refetch();
            toast({
                title: "Cita cancelada",
                description: "La cita ha sido cancelada exitosamente.",
            });
        } catch (error: any) {
            console.error('Error cancelando cita', error);
            toast({
                title: "Error",
                description: "Hubo un error al cancelar la cita.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div>Cargando citas…</div>;
    if (error) return <div>Error cargando citas</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Mis Citas</h1>
                    <Link to="/Appointment">
                        <Button variant="default">+ Nueva Cita</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto bg-white rounded shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                {showActionColumn && <TableHead>Acción</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {citas?.map((cita) => {
                                const showCancelButton = cita.estado === 'AGENDADA';
                                return (
                                    <TableRow key={cita.id}>
                                        <TableCell>{format(parseISO(cita.fecha), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{cita.hora.slice(11, 16)}</TableCell>
                                        <TableCell>
                                            {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                                        </TableCell>
                                        <TableCell>{cita.tipo}</TableCell>
                                        <TableCell>{cita.estado}</TableCell>
                                        {showActionColumn && (
                                            <TableCell>
                                                {showCancelButton && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => cancelarCita(cita.id)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    );
};

export default AppointmentsPage;
