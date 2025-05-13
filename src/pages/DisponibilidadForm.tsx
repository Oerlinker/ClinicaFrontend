import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Label} from '../components/ui/label';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import API from '../services/api';
import {useToast} from '../hooks/use-toast';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';


interface Doctor {
    id: number;
    usuario: { nombre: string; apellido: string; };
}

interface DisponibilidadPayload {
    empleado: { id: number };
    fecha: string;
    cupos: number;
    duracionSlot: number;
    horaInicio: string;
    horaFin: string;
}

const DisponibilidadForm: React.FC = () => {
    const [doctorId, setDoctorId] = useState<number | ''>('');
    const [fecha, setFecha] = useState<string>('');
    const [horaInicio, setHoraInicio] = useState<string>('');
    const [horaFin, setHoraFin] = useState<string>('');
    const [cupos, setCupos] = useState<number>(1);
    const [duracionSlot, setDuracionSlot] = useState<number>(30);
    const {user} = useAuth();


    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaFin, setFechaFin] = useState<string>('');

    const {toast} = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {data: doctors = [], isLoading} = useQuery<Doctor[]>({
        queryKey: ['doctores'],
        queryFn: async () => {
            const res = await API.get<Doctor[]>('/empleados/doctores');
            return res.data;
        },
    });

    const mutation = useMutation<void, Error, DisponibilidadPayload>({
        mutationFn: payload =>
            API.post('/disponibilidades', payload).then(() => {
            }),
        onSuccess: () => {
            toast({
                title: 'Disponibilidad creada',
                description: 'Se creó correctamente',
                variant: 'default',
            });
            queryClient.invalidateQueries({queryKey: ['disponibilidades']});
            if (user?.rol?.nombre === "ADMIN") {
                navigate('/admin-dashboard');
            } else if (user?.rol?.nombre === "SECRETARIA") {
                navigate('/secretaria-dashboard');
            } else {
                navigate('/'); // Default navigation
            }
        },
        onError: (err: any) => {
            toast({
                title: 'Error',
                description: err.response?.data?.error || err.message,
                variant: 'destructive',
            });
        },
    });


    const generarTodosMutation = useMutation({
        mutationFn: (params: { fechaInicio: string, fechaFin: string }) =>
            API.post(`/disponibilidades/generar-todos?fechaInicio=${params.fechaInicio}&fechaFin=${params.fechaFin}`),
        onSuccess: () => {
            toast({
                title: 'Disponibilidades generadas',
                description: 'Se generaron disponibilidades para todos los doctores',
                variant: 'default',
            });
            queryClient.invalidateQueries({queryKey: ['disponibilidades']});
        },
        onError: (err: any) => {
            toast({
                title: 'Error',
                description: err.response?.data?.error || err.message,
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorId || !fecha || !horaInicio || !horaFin || !cupos || !duracionSlot) {
            toast({
                title: 'Datos incompletos',
                description: 'Complete todos los campos',
                variant: 'destructive',
            });
            return;
        }
        mutation.mutate({
            empleado: {id: Number(doctorId)},
            fecha,
            cupos,
            duracionSlot,
            horaInicio: `${horaInicio}:00`,
            horaFin: `${horaFin}:00`,
        });
    };

    const handleGenerarTodos = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fechaInicio || !fechaFin) {
            toast({
                title: 'Fechas requeridas',
                description: 'Ingrese fecha de inicio y fin',
                variant: 'destructive',
            });
            return;
        }
        generarTodosMutation.mutate({
            fechaInicio,
            fechaFin
        });
    };

    return (
        <main className="max-w-lg mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Crear Disponibilidad</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow mb-8">
                <div>
                    <Label htmlFor="doctor">Doctor</Label>
                    <select
                        id="doctor"
                        value={doctorId}
                        onChange={(e) => setDoctorId(Number(e.target.value))}
                        className="w-full border rounded p-2"
                        required
                    >
                        <option value="">Seleccione un doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.usuario.nombre} {doctor.usuario.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                        type="date"
                        id="fecha"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border rounded p-2"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="horaInicio">Hora Inicio</Label>
                        <Input
                            type="time"
                            id="horaInicio"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="horaFin">Hora Fin</Label>
                        <Input
                            type="time"
                            id="horaFin"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cupos">Cupos</Label>
                        <Input
                            type="number"
                            id="cupos"
                            value={cupos}
                            onChange={(e) => setCupos(Number(e.target.value))}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="duracionSlot">Duración Slot (min)</Label>
                        <Input
                            type="number"
                            id="duracionSlot"
                            value={duracionSlot}
                            onChange={(e) => setDuracionSlot(Number(e.target.value))}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    Guardar Disponibilidad
                </Button>
            </form>

            {/* Sección para generar disponibilidades masivas */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Generar para todos los doctores</h2>
                <form onSubmit={handleGenerarTodos} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                            <Input
                                type="date"
                                id="fechaInicio"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="fechaFin">Fecha Fin</Label>
                            <Input
                                type="date"
                                id="fechaFin"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full border rounded p-2"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={generarTodosMutation.isPending}
                    >
                        {generarTodosMutation.isPending ? 'Generando...' : 'Generar Disponibilidades para Todos'}
                    </Button>
                </form>
            </div>
        </main>
    );
};

export default DisponibilidadForm;
