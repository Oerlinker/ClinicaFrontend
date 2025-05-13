import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import API from "../../services/api";
import {Input} from "../../components/ui/input";
import {Label} from "../../components/ui/label";
import {Button} from "../../components/ui/button";
import {useToast} from "../../hooks/use-toast";

interface CitaInfo {
    id: number;
    fecha: string;
    hora: string;
    paciente: {
        id: number;
        nombre: string;
        apellido: string;
    };
    tipo: string;
}

interface TriajeCreateDTO {
    citaId: number;
    presionArterial: number;
    frecuenciaCardiaca: number;
    temperatura: number;
    peso: number;
    altura: number;
    comentarios: string;
}

const RegistroTriaje: React.FC = () => {
    const {citaId} = useParams<{ citaId: string }>();
    const navigate = useNavigate();
    const {toast} = useToast();

    const [formData, setFormData] = useState<Omit<TriajeCreateDTO, "citaId">>({
        presionArterial: 0,
        frecuenciaCardiaca: 0,
        temperatura: 0,
        peso: 0,
        altura: 0,
        comentarios: "",
    });

    // 1. Buscar datos de la cita
    const { data: cita, isLoading, error } = useQuery<CitaInfo>({
        queryKey: ["cita", citaId],
        queryFn: () => API.get(`/citas/${citaId}`).then(res => res.data),
        enabled: !!citaId
    });

    // 2. Manejador de cambios
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {id, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [id]:
                e.target.type === "number"
                    ? parseFloat(value)
                    : value,
        }));
    };

    // 3. Envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cita) return;

        const payload: TriajeCreateDTO = {
            citaId: cita.id,
            ...formData,
        };

        try {
            await API.post("/triajes", payload);
            toast({title: "Triaje registrado correctamente"});
            // Opcional: redirigir a historial del paciente
            navigate(`/historial/${cita.paciente.id}`);
        } catch (err: any) {
            toast({
                title: "Error al registrar triaje",
                description: err.response?.data?.message || err.message,
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <p>Cargando cita…</p>;
    if (error) return <p>Error al cargar la cita.</p>;

    return (
        <div className="max-w-lg mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Registro de Triaje</h2>
            <div className="mb-6">
                <p>
                    <strong>Paciente:</strong> {cita?.paciente.nombre}{" "}
                    {cita?.paciente.apellido}
                </p>
                <p>
                    <strong>Fecha y hora:</strong> {cita?.fecha} {cita?.hora}
                </p>
                <p>
                    <strong>Tipo de cita:</strong> {cita?.tipo}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="presionArterial">Presión Arterial</Label>
                    <Input
                        id="presionArterial"
                        type="number"
                        step="0.1"
                        value={formData.presionArterial}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="frecuenciaCardiaca">Frecuencia Cardíaca</Label>
                    <Input
                        id="frecuenciaCardiaca"
                        type="number"
                        step="0.1"
                        value={formData.frecuenciaCardiaca}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="temperatura">Temperatura (°C)</Label>
                    <Input
                        id="temperatura"
                        type="number"
                        step="0.1"
                        value={formData.temperatura}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={formData.peso}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="altura">Altura (m)</Label>
                    <Input
                        id="altura"
                        type="number"
                        step="0.01"
                        value={formData.altura}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="comentarios">Comentarios</Label>
                    <textarea
                        id="comentarios"
                        value={formData.comentarios}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        rows={4}
                    />
                </div>

                <Button type="submit" className="w-full">
                    Guardar Triaje
                </Button>
            </form>
        </div>
    );
};

export default RegistroTriaje;
