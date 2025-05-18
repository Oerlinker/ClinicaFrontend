// src/components/AtencionForm.tsx
import { FormEvent, useEffect, useState } from "react";
import API from "../../services/api";
import { useToast } from "../../hooks/use-toast";

interface AtencionFormProps {
    citaId: number;
    onSuccess: () => void;
}

interface Patologia {
    id: number;
    nombre: string;
}

export default function AtencionForm({ citaId, onSuccess }: AtencionFormProps) {
    const { toast } = useToast();
    const [motivo, setMotivo] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [patologiaId, setPatologiaId] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        API.get<Patologia[]>("/patologias")
            .then(res => setPatologias(res.data))
            .catch(() => {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las patologías.",
                    variant: "destructive",
                });
            });
    }, [toast]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);


        const payload: any = {
            citaId,
            motivo,
            diagnostico,
            tratamiento,
            observaciones,
        };
        if (patologiaId !== "") {
            payload.patologiaId = patologiaId;
        }

        try {
            await API.post("/atenciones", payload);
            toast({
                title: "Atención registrada",
                description: "Se registró la atención exitosamente.",
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al registrar la atención");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Registrar Atención</h2>


            <div>
                <label className="block mb-1">Motivo:</label>
                <input
                    type="text"
                    required
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Diagnóstico */}
            <div>
                <label className="block mb-1">Diagnóstico:</label>
                <textarea
                    required
                    value={diagnostico}
                    onChange={e => setDiagnostico(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Tratamiento */}
            <div>
                <label className="block mb-1">Tratamiento:</label>
                <textarea
                    required
                    value={tratamiento}
                    onChange={e => setTratamiento(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Observaciones */}
            <div>
                <label className="block mb-1">Observaciones:</label>
                <textarea
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Select de Patologías (opcional) */}
            <div>
                <label className="block mb-1">Patología (opcional):</label>
                <select
                    value={patologiaId}
                    onChange={e =>
                        setPatologiaId(e.target.value === "" ? "" : +e.target.value)
                    }
                    className="w-full border rounded p-2"
                >
                    <option value="">-- Ninguna --</option>
                    {patologias.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Mensaje de error */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Botón guardar */}
            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
                Guardar Atención
            </button>
        </form>
    );
}
