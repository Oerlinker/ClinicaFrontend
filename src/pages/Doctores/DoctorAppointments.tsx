import React, {useState, useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import API from '../../services/api';
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '../../components/ui/table';
import {Button} from '../../components/ui/button';
import {useToast} from '../../hooks/use-toast';
import {format, parseISO} from 'date-fns';
import {X} from 'lucide-react';

interface Cita {
    id: number;
    fecha: string;
    hora: string;
    estado: string;
    paciente: { nombre: string; apellido: string };
}

const DoctorAppointments: React.FC = () => {
    const {toast} = useToast();
    const [citas, setCitas] = useState<Cita[]>([]);

    const {data, isLoading, error, refetch} = useQuery<Cita[]>({
        queryKey: ['citas-doctor'],
        queryFn: () => API.get('/citas/mis-citas-doctor').then(r => r.data),
    });

    useEffect(() => {
        if (data) {
            const today = new Date();

            const filteredCitas = data.filter(cita => {
                const citaDate = parseISO(cita.fecha);
                return citaDate >= today;
            });

            setCitas(filteredCitas);
        }
    }, [data]);

    const marcarRealizada = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/realizar`);
            setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
            refetch();
            toast({
                title: "Cita marcada como realizada",
                description: "La cita ha sido marcada como realizada exitosamente.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Hubo un error al marcar la cita como realizada.",
                variant: "destructive",
            });
        }
    };

    const cancelar = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/cancelar-doctor`);
            setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
            refetch();
            toast({
                title: "Cita cancelada",
                description: "La cita ha sido cancelada exitosamente.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Hubo un error al cancelar la cita.",
                variant: "destructive",
            });
        }
    };

    const handleRemoveCita = (id: number) => {
        setCitas(prevCitas => prevCitas.filter(cita => cita.id !== id));
    };

    if (isLoading) return <div>Cargando citas…</div>;
    if (error) return <div>Error al cargar citas</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-4">Citas Asignadas</h2>
            <div className="overflow-x-auto bg-white rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {citas?.map((cita) => (
                            <TableRow key={cita.id}>
                                <TableCell>{format(parseISO(cita.fecha), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{cita.hora.slice(11, 16)}</TableCell>
                                <TableCell>{cita.paciente.nombre} {cita.paciente.apellido}</TableCell>
                                <TableCell>{cita.estado}</TableCell>
                                <TableCell>
                                    {cita.estado !== 'CANCELADA' && cita.estado !== 'REALIZADA' ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => marcarRealizada(cita.id)}
                                                className="mr-2"
                                            >
                                                Marcar Realizada
                                            </Button>
                                            <Button variant="destructive" onClick={() => cancelar(cita.id)}>
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveCita(cita.id)}
                                        >
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default DoctorAppointments;
