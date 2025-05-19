import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import API from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

interface Props {
    patologia?: {
        id: number;
        codigo: string;
        nombre: string;
        descripcion: string;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const PatologiasRegister: React.FC<Props> = ({ patologia, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    useEffect(() => {
        if (patologia) {
            setCodigo(patologia.codigo);
            setNombre(patologia.nombre);
            setDescripcion(patologia.descripcion);
        }
    }, [patologia]);

    const mutation = useMutation({
        mutationFn: async () => {
            const dto = { codigo, nombre, descripcion };
            if (patologia) {
                return API.put(`/patologias/${patologia.id}`, dto);
            }
            return API.post("/patologias", dto);
        },
        onSuccess: () => {
            toast({
                title: patologia ? "Actualizado" : "Creado",
                description: `Patología ${patologia ? "actualizada" : "creada"} correctamente.`,
            });
            onSuccess?.();
        },
        onError: () => {
            toast({ title: "Error", variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">
                {patologia ? "Editar Patología" : "Registrar Patología"}
            </h3>
            <div>
                <label className="block font-medium">Código</label>
                <Input
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block font-medium">Nombre</label>
                <Input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                />
            </div>
            <div>
                <label className="block font-medium">Descripción</label>
                <Textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={mutation.isPending}>
                    {patologia ? "Guardar cambios" : "Crear patología"}
                </Button>
            </div>
        </form>
    );
};

export default PatologiasRegister;
