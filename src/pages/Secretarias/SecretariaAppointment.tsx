import React, {useState} from "react";
import {useAuth} from "../../contexts/AuthContext";
import {Navigate, useNavigate} from "react-router-dom";
import {useQuery, useMutation, useQueryClient, UseQueryResult} from "@tanstack/react-query";
import API from "../../services/api";
import Header from "../../components/Header";
import {Label} from "../../components/ui/label";
import {Input} from "../../components/ui/input";
import {Button} from "../../components/ui/button";

type Empleado = {
    id: number;
    usuario: { nombre: string; apellido: string };
    cargo: { nombre: string };
};
type Usuario = { id: number; nombre: string; apellido: string };

const SecretariaAppointment: React.FC = () => {
    const {user} = useAuth();
    const isSecretaria =
        !!user &&
        user.rol?.nombre === "EMPLEADO" &&
        user.cargo?.nombre === "Secretaria";

    const navigate = useNavigate();
    const qc = useQueryClient();

    const [form, setForm] = useState({
        pacienteId: "",
        doctorId: "",
        fecha: "",
        hora: "",
        tipo: "CONSULTA",
    });

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

    const nuevaCita = useMutation({
        mutationFn: () =>
            API.post("/citas", {
                pacienteId: Number(form.pacienteId),
                doctorId: Number(form.doctorId),
                fecha: form.fecha,
                hora: form.hora,
                tipo: form.tipo,
            }),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["citas-admin"]});
            navigate("/secretaria-dashboard");
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
    ) =>
        setForm({
            ...form,
            [e.target.id]: e.target.value,
        });

    if (!isSecretaria) {
        return <Navigate to="/no-permission" replace/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header/>
            <main className="flex-grow container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Agendar Cita</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        nuevaCita.mutate();
                    }}
                    className="max-w-md space-y-4"
                >
                    <div>
                        <Label htmlFor="pacienteId">Paciente</Label>
                        <select
                            id="pacienteId"
                            value={form.pacienteId}
                            onChange={handleChange}
                            required
                            className="w-full"
                        >
                            <option value="">— Selecciona paciente —</option>
                            {pacientes.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nombre} {u.apellido}
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
                            required
                            className="w-full"
                        >
                            <option value="">— Selecciona doctor —</option>
                            {doctores.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.usuario.nombre} {d.usuario.apellido}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                            id="hora"
                            type="time"
                            value={form.hora}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="tipo">Tipo</Label>
                        <select
                            id="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                            className="w-full"
                        >
                            <option value="CONSULTA">Consulta</option>
                            <option value="RUTINA">Rutina</option>
                            <option value="CONTROL">Control</option>
                            <option value="PEDIÁTRICA">Pediátrica</option>
                            <option value="PRE-QUIRÚRGICA">Pre-quirúrgica</option>
                            <option value="POST-QUIRÚRGICA">Post-quirúrgica</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full">
                        Agendar
                    </Button>
                </form>
            </main>
        </div>
    );
};

export default SecretariaAppointment;
