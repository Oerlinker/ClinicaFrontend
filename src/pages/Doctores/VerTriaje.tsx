import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../../services/api";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

interface TriajeDTO {
    id: number;
    citaId: number;
    fechaHoraRegistro: string;
    presionArterial: number;
    frecuenciaCardiaca: number;
    temperatura: number;
    peso: number;
    altura: number;
    comentarios: string;
}

const VerTriaje: React.FC = () => {
    const { citaId } = useParams<{ citaId: string }>();

    const { data, isLoading, error } = useQuery<TriajeDTO>({
        queryKey: ["triaje", citaId],
        queryFn: () => API.get(`/triajes/cita/${citaId}`).then(res => res.data),
        enabled: Boolean(citaId)
    });

    if (isLoading) return <p>Cargando triaje…</p>;
    if (error)     return <p>Error al cargar el triaje.</p>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Detalle de Triaje</h2>
            <div className="space-y-3">
                <div>
                    <Label>Registro</Label>
                    <Input
                        value={new Date(data!.fechaHoraRegistro).toLocaleString()}
                        readOnly
                    />
                </div>
                <div>
                    <Label>Presión Arterial</Label>
                    <Input value={data!.presionArterial} readOnly />
                </div>
                <div>
                    <Label>Frecuencia Cardíaca</Label>
                    <Input value={data!.frecuenciaCardiaca} readOnly />
                </div>
                <div>
                    <Label>Temperatura (°C)</Label>
                    <Input value={data!.temperatura} readOnly />
                </div>
                <div>
                    <Label>Peso (kg)</Label>
                    <Input value={data!.peso} readOnly />
                </div>
                <div>
                    <Label>Altura (m)</Label>
                    <Input value={data!.altura} readOnly />
                </div>
                <div>
                    <Label>Comentarios</Label>
                    <Textarea value={data!.comentarios} readOnly />
                </div>
            </div>

            <div className="mt-6 flex justify-between">
                <Link to="/doctor-dashboard">
                    <Button variant="outline">Volver a Citas</Button>
                </Link>
            </div>
        </div>
    );
};

export default VerTriaje;
