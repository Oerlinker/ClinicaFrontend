import React, {useState, useEffect} from "react";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {useQuery} from "@tanstack/react-query";
import API from "../services/api";
import {useAuth} from "../contexts/AuthContext";
import Header from "../components/Header";
import {useNavigate} from "react-router-dom";
import {useToast} from "../hooks/use-toast";

interface Doctor {
    id: number;
    usuario: {
        nombre: string;
        apellido: string;
    };
}

interface Disponibilidad {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    duracionSlot: number;
    cupos: number;
}

interface CitaData {
    id: number;
    fecha: string;
    hora: string;
}

const Appointment: React.FC = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {toast} = useToast();


    const [formData, setFormData] = useState({
        fecha: "",
        hora: "",
        tipo: "",
        doctorId: "",
    });


    const [disp, setDisp] = useState<Disponibilidad | null>(null);
    const [citas, setCitas] = useState<CitaData[]>([]);
    const [slots, setSlots] = useState<string[]>([]);


    const {
        data: doctors,
        isLoading: doctorsLoading,
        error: doctorsError,
    } = useQuery<Doctor[]>({
        queryKey: ["doctores"],
        queryFn: async () => {
            const response = await API.get("/empleados/doctores");
            return response.data;
        },
    });


    useEffect(() => {
        const {doctorId, fecha} = formData;
        if (doctorId && fecha) {
            API.get<Disponibilidad>(`/disponibilidades/empleado/${doctorId}/fecha/${fecha}`)
                .then(res => setDisp(res.data))
                .catch(() => setDisp(null));

            API.get<CitaData[]>(`/citas/doctor/${doctorId}/fecha/${fecha}`)
                .then(res => setCitas(res.data))
                .catch(() => setCitas([]));
        } else {
            setDisp(null);
            setCitas([]);
            setSlots([]);
        }
    }, [formData.doctorId, formData.fecha]);


    useEffect(() => {
        if (!disp) {
            setSlots([]);
            return;
        }


        const [h0, m0] = disp.horaInicio.slice(0, 5).split(":").map(Number);
        const [h1, m1] = disp.horaFin.slice(0, 5).split(":").map(Number);
        const startMin = h0 * 60 + m0;
        const endMin = h1 * 60 + m1;


        const allSlots: string[] = [];
        for (let t = startMin; t + disp.duracionSlot <= endMin; t += disp.duracionSlot) {
            const hh = String(Math.floor(t / 60)).padStart(2, "0");
            const mm = String(t % 60).padStart(2, "0");
            allSlots.push(`${hh}:${mm}`);
        }


        const booked = citas.map(c =>
            c.hora.substring(c.hora.indexOf("T") + 1, c.hora.indexOf("T") + 6)
        );


        const available = allSlots.filter(slot => {
            const usedCount = booked.filter(b => b === slot).length;
            return usedCount < disp.cupos;
        });

        setSlots(available);
    }, [disp, citas]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {fecha, hora, tipo, doctorId} = formData;

        if (!user || !fecha || !hora || !tipo || !doctorId) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos.",
                variant: "destructive",
            });
            return;
        }

        const appointmentData = {
            fecha,
            hora: `${hora}:00`,
            estado: "AGENDADA",
            tipo,
            paciente: {id: user.id},
            doctor: {id: Number(doctorId)},
        };

        try {
            const response = await API.post("/citas", appointmentData);
            const {id, precio} = response.data;
            toast({
                title: "Cita agendada",
                description: "Redirigiendo a pago...",
            });
            navigate(`/payment/${id}/${user.id}/${precio}/USD`);
        } catch (err: any) {
            toast({
                title: "Error al agendar",
                description: err.response?.data?.error || err.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header/>
            <main className="flex-grow bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">Agendar Cita</h2>
                <form
                    onSubmit={handleSubmit}
                    className="max-w-md w-full bg-white shadow rounded p-4 space-y-4"
                >

                    <div>
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                    </div>


                    <div>
                        <Label htmlFor="hora">Hora</Label>
                        {slots.length > 0 ? (
                            <select
                                id="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                required
                                className="w-full border rounded p-2"
                            >
                                <option value="" disabled>
                                    Seleccione un horario
                                </option>
                                {slots.map(s => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        ) : formData.doctorId && formData.fecha ? (
                            <p className="text-sm text-gray-500">
                                No hay turnos disponibles para esta fecha con este doctor.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Seleccione la fecha y el doctor para ver horarios.
                            </p>
                        )}
                    </div>


                    <div>
                        <Label htmlFor="tipo">Tipo de Cita</Label>
                        <select
                            id="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            required
                            className="border p-2 rounded w-full"
                        >
                            <option value="" disabled>
                                Seleccione un tipo
                            </option>
                            <option value="Rutina">Rutina</option>
                            <option value="Control">Control</option>
                            <option value="Pediátrica">Pediátrica</option>
                            <option value="Pre-quirúrgica">Pre-quirúrgica</option>
                            <option value="Post-quirúrgica">Post-quirúrgica</option>
                        </select>
                    </div>


                    <div>
                        <Label htmlFor="doctorId">Doctor</Label>
                        {doctorsLoading ? (
                            <p>Cargando doctores...</p>
                        ) : doctorsError ? (
                            <p>Error al cargar doctores</p>
                        ) : (
                            <select
                                id="doctorId"
                                value={formData.doctorId}
                                onChange={handleChange}
                                required
                                className="border p-2 rounded w-full"
                            >
                                <option value="" disabled>
                                    Seleccione un doctor
                                </option>
                                {doctors?.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.usuario.nombre} {doc.usuario.apellido}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Agendar Cita
                    </Button>
                </form>
            </main>
        </div>
    );
};

export default Appointment;
