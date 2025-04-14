
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useQuery } from "@tanstack/react-query";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";

interface Doctor {
    id: number;
    usuario: {
        nombre: string;
        apellido: string;
    };
}

const Appointment: React.FC = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        fecha: "",
        hora: "",
        tipo: "",
        doctorId: "",
    });

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
        if (!user) {
            console.error("Usuario no autenticado.");
            return;
        }


        if (!formData.fecha || !formData.hora || !formData.tipo || !formData.doctorId) {
            console.error("Todos los campos son obligatorios.");
            alert("Por favor, completa todos los campos antes de enviar.");
            return;
        }


        const appointmentData = {
            fecha: formData.fecha,
            hora: formData.hora,
            estado: "AGENDADA",
            tipo: formData.tipo,
            paciente: { id: user.id },
            doctor: { id: Number(formData.doctorId) },
        };

        console.log("Datos enviados al servidor:", appointmentData);

        try {
            const response = await API.post("/citas", appointmentData);
            console.log("Respuesta del servidor:", response.data);
        } catch (error: any) {
            console.error("Error al agendar cita:", error);
            console.error("Status:", error.response?.status);
            console.error("Respuesta completa:", error.response?.data);
            alert("Error al agendar la cita. Por favor, verifica los datos e inténtalo nuevamente.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">Agendar Cita</h2>
                <form onSubmit={handleSubmit} className="max-w-md w-full bg-white shadow rounded p-4">
                    <div className="mb-4">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                            id="hora"
                            type="time"
                            value={formData.hora}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
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
                    <div className="mb-4">
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
                                {doctors?.map((doc) => (
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

