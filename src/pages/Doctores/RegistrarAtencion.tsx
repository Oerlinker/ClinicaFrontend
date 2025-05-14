import { useState } from "react";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import API from "../../services/api";

interface Props {
    citaId: number;
    doctorId: number;
    pacienteId: number;
    onClose: () => void;
}

export default function RegistrarAtencion({ citaId, doctorId, pacienteId, onClose }: Props) {
    const [motivo, setMotivo] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Crear la atención
            await API.post("/atenciones", {
                citaId,
                doctorId,
                pacienteId,
                motivo,
                diagnostico,
                tratamiento,
                observaciones
            });

            // 2. Marcar cita como REALIZADA
            await API.patch(`/citas/${citaId}/estado`, { estado: "REALIZADA" });

            alert("Atención registrada correctamente.");
            onClose();
        } catch (err) {
            alert("Error al registrar la atención.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <Label>Motivo de consulta</Label>
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>

            <div>
                <Label>Diagnóstico</Label>
                <Input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
            </div>

            <div>
                <Label>Tratamiento</Label>
                <Input value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} />
            </div>

            <div>
                <Label>Observaciones</Label>
                <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Atención"}
                </Button>
            </div>
        </div>
    );
}
