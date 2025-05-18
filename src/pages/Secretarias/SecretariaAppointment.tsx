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

        interface DisponibilidadDTO {
            id: number;
            fecha: string;
            horaInicio: string;
            horaFin: string;
            duracionSlot: number;
            cupos: number;
            slots: { hora: string; cuposRestantes: number }[];
        }

        interface Servicio {
            id: number;
            nombre: string;
            descripcion: string;
            precio: number;
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
                servicioId: "",
            });

            const [slots, setSlots] = useState<string[]>([]);
            const [servicios, setServicios] = useState<Servicio[]>([]);

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

            // Cargar servicios al iniciar
            useEffect(() => {
                API.get<Servicio[]>("/servicios")
                    .then(({ data }) => setServicios(data))
                    .catch(() =>
                        toast({
                            title: "Error",
                            description: "No se pudieron cargar los servicios.",
                            variant: "destructive",
                        })
                    );
            }, [toast]);

            // Cargar slots disponibles cuando cambia doctor o fecha
            useEffect(() => {
                const { doctorId, fecha } = form;
                if (!doctorId || !fecha) {
                    setSlots([]);
                    return;
                }
                API.get<DisponibilidadDTO>(
                    `/disponibilidades/empleado/${doctorId}/slots`,
                    { params: { fecha } }
                )
                    .then(({ data }) => {
                        setSlots(
                            data.slots.filter((s) => s.cuposRestantes > 0).map((s) => s.hora)
                        );
                    })
                    .catch(() => setSlots([]));
            }, [form.doctorId, form.fecha]);

            const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                setForm({
                    ...form,
                    [e.target.id]: e.target.value,
                });
            };

            const nuevaCita = useMutation({
                mutationFn: async () => {
                    if (!form.pacienteId || !form.doctorId || !form.fecha || !form.hora || !form.servicioId) {
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
                        estado: "AGENDADA",
                        servicioId: Number(form.servicioId),
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
                                <Label htmlFor="servicioId">Servicio</Label>
                                {servicios.length > 0 ? (
                                    <select
                                        id="servicioId"
                                        value={form.servicioId}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="" disabled>
                                            Seleccione un servicio
                                        </option>
                                        {servicios.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre} — ${s.precio / 100}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-500">Cargando servicios...</p>
                                )}
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
