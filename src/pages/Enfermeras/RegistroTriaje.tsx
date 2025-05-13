import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { format, parseISO } from "date-fns";

interface Cita {
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
    const [citas, setCitas]         = useState<Cita[]>([]);
    const [filtradas, setFiltradas] = useState<Cita[]>([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);


    const [formData, setFormData] = useState<Omit<TriajeCreateDTO, "citaId">>({
        presionArterial: 0,
        frecuenciaCardiaca: 0,
        temperatura: 0,
        peso: 0,
        altura: 0,
        comentarios: "",
    });


    useEffect(() => {
        API.get<Cita[]>("/citas/pendientes-triaje")
            .then(res => {
                setCitas(res.data);
                setFiltradas(res.data);
            })
            .catch(() => toast({ title:"Error al cargar citas", variant:"destructive" }));
    }, []);


    useEffect(() => {
        const txt = busqueda.toLowerCase().trim();
        setFiltradas(
            citas.filter(c =>
                `${c.paciente.nombre} ${c.paciente.apellido}`.toLowerCase().includes(txt)
            )
        );
    }, [busqueda, citas]);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === "number" ? parseFloat(value) : value,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citaSeleccionada) return;
        const payload: TriajeCreateDTO = {
            citaId: citaSeleccionada.id,
            ...formData,
        };
        try {
            await API.post("/triajes", payload);
            toast({ title: "Triaje registrado correctamente" });
            navigate("/doctores/citas");
        } catch (err: any) {
            toast({
                title: "Error al guardar triaje",
                description: err.response?.data?.message || err.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {!citaSeleccionada ? (
                <>
                    <h2 className="text-2xl font-bold">Buscar Cita para Triaje</h2>
                    <div className="space-y-2">
                        <Label htmlFor="busqueda">Nombre de Paciente</Label>
                        <Input
                            id="busqueda"
                            placeholder="Escribe nombre o apellido"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="overflow-auto max-h-80 border rounded">
                        <table className="w-full">
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
                            {filtradas.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-2">{c.paciente.nombre} {c.paciente.apellido}</td>
                                    <td className="p-2">{format(parseISO(c.fecha), "dd/MM/yyyy")}</td>
                                    <td className="p-2">{c.hora.slice(11,16)}</td>
                                    <td className="p-2">{c.tipo}</td>
                                    <td className="p-2">
                                        <Button size="sm" onClick={() => setCitaSeleccionada(c)}>
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
                    <Button variant="ghost" onClick={() => setCitaSeleccionada(null)}>
                        ← Volver a búsqueda
                    </Button>
                    <h2 className="text-2xl font-bold">Registrar Triaje</h2>
                    <div className="mb-4">
                        <p>
                            <strong>Paciente:</strong>{" "}
                            {citaSeleccionada.paciente.nombre}{" "}
                            {citaSeleccionada.paciente.apellido}
                        </p>
                        <p>
                            <strong>Fecha y hora:</strong>{" "}
                            {format(parseISO(citaSeleccionada.fecha), "dd/MM/yyyy")}{" "}
                            {citaSeleccionada.hora.slice(11,16)}
                        </p>
                        <p>
                            <strong>Tipo de cita:</strong> {citaSeleccionada.tipo}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Presión Arterial */}
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
                        {/* ...otros campos idénticos a antes */}
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
