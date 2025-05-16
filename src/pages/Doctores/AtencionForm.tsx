import { FormEvent, useState } from "react";
import API from "../../services/api";
import { useToast } from "../../hooks/use-toast";

interface AtencionFormProps {
    citaId: number;
    onSuccess: () => void;
}

export default function AtencionForm({ citaId, onSuccess }: AtencionFormProps) {
    const { toast } = useToast();
    const [motivo, setMotivo] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await API.post("/atenciones", {
                citaId,
                motivo,
                diagnostico,
                tratamiento,
                observaciones,
            });
            toast({
                title: "Atención registrada",
                description: "La atención se ha registrado con éxito.",
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al registrar la atención");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Registrar Atención</h2>


            <input type="hidden" value={citaId} />


            <div>
                <label className="block mb-1">Motivo:</label>
                <input
                    type="text"
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>


            <div>
                <label className="block mb-1">Diagnóstico:</label>
                <textarea
                    required
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>


            <div>
                <label className="block mb-1">Tratamiento:</label>
                <textarea
                    required
                    value={tratamiento}
                    onChange={(e) => setTratamiento(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>


            <div>
                <label className="block mb-1">Observaciones:</label>
                <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
                Guardar Atención
            </button>
        </form>
    );
}
