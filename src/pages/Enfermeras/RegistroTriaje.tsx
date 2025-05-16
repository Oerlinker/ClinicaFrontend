// src/pages/Enfermeras/RegistroTriaje.tsx
import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { format, parseISO } from "date-fns";

interface CitaInfo {
    id: number;
    fecha: string;
    hora: string;
    tipo: string;
    paciente: {
        id: number;
        nombre: string;
        apellido: string;
    };
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
    const { toast } = useToast();
    const navigate = useNavigate();


    const [busqueda, setBusqueda] = useState("");
    const [citas, setCitas] = useState<CitaInfo[]>([]);
    const [filtradas, setFiltradas] = useState<CitaInfo[]>([]);
    const [citaSel, setCitaSel] = useState<CitaInfo | null>(null);


    const [formData, setFormData] = useState<Omit<TriajeCreateDTO, "citaId">>({
        presionArterial: 0,
        frecuenciaCardiaca: 0,
        temperatura: 0,
        peso: 0,
        altura: 0,
        comentarios: "",
    });


    useEffect(() => {
        API.get<CitaInfo[]>("/citas/pendientes-triaje")
            .then((res) => {
                setCitas(res.data);
                setFiltradas(res.data);
            })
            .catch(() =>
                toast({ title: "Error al cargar citas", variant: "destructive" })
            );
    }, []);


    useEffect(() => {
        const txt = busqueda.toLowerCase().trim();
        setFiltradas(
            citas.filter((c) =>
                `${c.paciente.nombre} ${c.paciente.apellido}`
                    .toLowerCase()
                    .includes(txt)
            )
        );
    }, [busqueda, citas]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: type === "number" ? parseFloat(value) : value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citaSel) return;

        const payload: TriajeCreateDTO = {
            citaId: citaSel.id,
            ...formData,
        };

        try {
            await API.post("/triajes", payload);
            toast({ title: "Triaje registrado correctamente" });
            navigate("/enfermera-dashboard");
        } catch (err: any) {
            toast({
                title: "Error al guardar triaje",
                description: err.response?.data?.message || err.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded shadow">
            {!citaSel ? (
                <>
                    <h2 className="text-2xl font-bold">Buscar Cita para Triaje</h2>
                    <div className="mb-4">
                        <Label htmlFor="busqueda">Paciente</Label>
                        <Input
                            id="busqueda"
                            placeholder="Nombre o apellido"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="overflow-auto max-h-64 border rounded">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Paciente</th>
                                <th className="p-2">Fecha</th>
                                <th className="p-2">Hora</th>
                                <th className="p-2">Tipo</th>
                                <th className="p-2">Acción</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtradas.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-2">
                                        {c.paciente.nombre} {c.paciente.apellido}
                                    </td>
                                    <td className="p-2">
                                        {format(parseISO(c.fecha), "dd/MM/yyyy")}
                                    </td>
                                    <td className="p-2">{c.hora.slice(11, 16)}</td>
                                    <td className="p-2">{c.tipo}</td>
                                    <td className="p-2">
                                        <Button size="sm" onClick={() => setCitaSel(c)}>
                                            Seleccionar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <Button variant="ghost" onClick={() => setCitaSel(null)}>
                        ← Cambiar cita
                    </Button>
                    <h2 className="text-2xl font-bold">Registro de Triaje</h2>
                    <div className="mb-6">
                        <p>
                            <strong>Paciente:</strong> {citaSel.paciente.nombre}{" "}
                            {citaSel.paciente.apellido}
                        </p>
                        <p>
                            <strong>Fecha y hora:</strong>{" "}
                            {format(parseISO(citaSel.fecha), "dd/MM/yyyy")}{" "}
                            {citaSel.hora.slice(11, 16)}
                        </p>
                        <p>
                            <strong>Tipo de cita:</strong> {citaSel.tipo}
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
                            <Label htmlFor="frecuenciaCardiaca">
                                Frecuencia Cardíaca
                            </Label>
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
                </>
            )}
        </div>
    );
};

export default RegistroTriaje;
