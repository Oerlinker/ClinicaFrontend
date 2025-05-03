import React, {useState, useEffect} from "react";
import {useAuth} from "../../contexts/AuthContext";
import {Navigate, useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import API from "../../services/api";
import {Label} from "../../components/ui/label";
import {Input} from "../../components/ui/input";
import {Button} from "../../components/ui/button";
import {useToast} from "../../hooks/use-toast";

type Empleado = {
    id: number;
    usuario: { nombre: string; apellido: string };
    cargo: { nombre: string };
};
type Usuario = { id: number; nombre: string; apellido: string };

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

const SecretariaAppointment: React.FC = () => {
    const {user} = useAuth();
    const isSecretaria = Boolean(user && user.rol?.nombre === "SECRETARIA");
    const navigate = useNavigate();
    const qc = useQueryClient();
    const {toast} = useToast();

    const [form, setForm] = useState({
        pacienteId: "",
        doctorId: "",
        fecha: "",
        hora: "",
        tipo: "CONSULTA",
    });

    const [disp, setDisp] = useState<Disponibilidad | null>(null);
    const [citas, setCitas] = useState<CitaData[]>([]);
    const [slots, setSlots] = useState<string[]>([]);

    const {data: doctores = []}: UseQueryResult<Empleado[], Error> = useQuery<Empleado[], Error>({
        queryKey: ["doctores"],
        queryFn: () =>
            API.get<Empleado[]>("/empleados/doctores").then((r) => r.data),
        enabled: isSecretaria,
    });
    const {data: pacientes = []}: UseQueryResult<Usuario[], Error> = useQuery<Usuario[], Error>({
        queryKey: ["pacientes"],
        queryFn: () =>
            API.get<Usuario[]>("/auth/usuarios/pacientes").then((r) => r.data),
        enabled: isSecretaria,
    });

    useEffect(() => {
        const {doctorId, fecha} = form;
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
    }, [form.doctorId, form.fecha]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.id]: e.target.value,
        });
    };

    const nuevaCita = useMutation({
        mutationFn: async () => {
            if (!form.pacienteId || !form.doctorId || !form.fecha || !form.hora || !form.tipo) {
                toast({
                    title: "Error",
                    description: "Por favor completa todos los campos.",
                    variant: "destructive",
                });
                throw new Error("Por favor completa todos los campos.");
            }
            return await API.post("/citas", {
                fecha: form.fecha,
                hora: `${form.hora}:00`,
                estado: "Agendada",
                tipo: form.tipo,
                paciente: {id: Number(form.pacienteId)},
                doctor: {id: Number(form.doctorId)},
            });
        },
        onSuccess: () => {
            toast({
                title: "Cita agendada",
                description: "La cita ha sido agendada exitosamente.",
            });
            qc.invalidateQueries({queryKey: ["citas-admin"]});
            navigate("/secretaria-dashboard");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Hubo un error al agendar la cita.",
                variant: "destructive",
            });
        },
    });

    if (!isSecretaria) {
        return <Navigate to="/no-permission" replace/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-4">Agendar Cita</h2>
            <div className="max-w-md mx-auto bg-white rounded shadow p-6">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    nuevaCita.mutate();
                }} className="space-y-4">
                    <div>
                        <Label htmlFor="pacienteId">Paciente</Label>
                        <select
                            id="pacienteId"
                            value={form.pacienteId}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">Seleccione un paciente</option>
                            {pacientes?.map(paciente => (
                                <option key={paciente.id} value={paciente.id}>
                                    {paciente.nombre} {paciente.apellido}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="doctorId">Doctor</Label>
                        <select
                            id="doctorId"
                            value={form.doctorId}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">Seleccione un doctor</option>
                            {doctores?.map(doctor => (
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
                            value={form.fecha}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="hora">Hora</Label>
                        {slots.length > 0 ? (
                            <select
                                id="hora"
                                value={form.hora}
                                onChange={handleChange}
                                className="w-full border rounded p-2"
                                required
                            >
                                <option value="">Seleccione un horario</option>
                                {slots.map(slot => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                        ) : form.doctorId && form.fecha ? (
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
                            value={form.tipo}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">Seleccione un tipo</option>
                            <option value="Rutina">Rutina</option>
                            <option value="Control">Control</option>
                            <option value="Pediatrica">Pediatrica</option>
                            <option value="Pre-quirúrgica">Pre-quirúrgica</option>
                            <option value="Post-quirúrgica">Post-quirúrgica</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Agendar Cita
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default SecretariaAppointment;
