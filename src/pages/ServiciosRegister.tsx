import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import API from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

interface Props {
    servicio?: {
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
    };
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ServiciosRegister: React.FC<Props> = ({ servicio, onSuccess, onCancel }) => {
    const { toast } = useToast();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState<number | "">("");

    // Si llega un servicio, precarga para edición
    useEffect(() => {
        if (servicio) {
            setNombre(servicio.nombre);
            setDescripcion(servicio.descripcion);
            setPrecio(servicio.precio);
        }
    }, [servicio]);

    // Mutación de crear y actualizar
    const mutation = useMutation({
        mutationFn: async () => {
            const dto = { nombre, descripcion, precio: Number(precio) };
            if (servicio) {
                return API.put(`/servicios/${servicio.id}`, dto);
            }
            return API.post("/servicios", dto);
        },
        onSuccess: () => {
            toast({
                title: servicio ? "Actualizado" : "Creado",
                description: `Servicio ${servicio ? "actualizado" : "creado"} correctamente.`,
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
                {servicio ? "Editar Servicio" : "Registrar Servicio"}
            </h3>
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
            <div>
                <label className="block font-medium">Precio</label>
                <Input
                    type="number"
                    value={precio}
                    onChange={e => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" disabled={mutation.isPending}>
                    {servicio ? "Guardar cambios" : "Crear servicio"}
                </Button>
            </div>
        </form>
    );
};

export default ServiciosRegister;
