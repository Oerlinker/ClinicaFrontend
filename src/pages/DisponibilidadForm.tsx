import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Label} from '../components/ui/label';
import {Input} from '../components/ui/input';
import {Button} from '../components/ui/button';
import Header from '../components/Header';
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
    const { user } = useAuth();

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

    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>
            <main className="max-w-lg mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Crear Disponibilidad</h1>

                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
                    <div>
                        <Label htmlFor="doctor">Doctor</Label>
                        <select
                            id="doctor"
                            value={doctorId}
                            onChange={e => setDoctorId(Number(e.target.value))}
                            required
                            className="w-full border rounded p-2"
                            disabled={isLoading}
                        >
                            <option value="" disabled>
                                {isLoading ? 'Cargando doctores...' : 'Seleccione un doctor'}
                            </option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.usuario.nombre} {doc.usuario.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="horaInicio">Hora Inicio</Label>
                            <Input
                                id="horaInicio"
                                type="time"
                                value={horaInicio}
                                onChange={e => setHoraInicio(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="horaFin">Hora Fin</Label>
                            <Input
                                id="horaFin"
                                type="time"
                                value={horaFin}
                                onChange={e => setHoraFin(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cupos">Cupos</Label>
                            <Input
                                id="cupos"
                                type="number"
                                min={1}
                                value={cupos}
                                onChange={e => setCupos(Number(e.target.value))}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="duracionSlot">Duración (min)</Label>
                            <Input
                                id="duracionSlot"
                                type="number"
                                min={1}
                                value={duracionSlot}
                                onChange={e => setDuracionSlot(Number(e.target.value))}
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Guardar Disponibilidad
                    </Button>
                </form>
            </main>
        </div>
    );
};

export default DisponibilidadForm;
