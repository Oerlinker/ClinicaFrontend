import React, { useState } from "react";
    import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
    import API from "../services/api";
    import {
        Table,
        TableHeader,
        TableRow,
        TableHead,
        TableBody,
        TableCell,
    } from "../components/ui/table";
    import { Button } from "../components/ui/button";
    import { useToast } from "../hooks/use-toast";
    import ServiciosRegister from "./ServiciosRegister";

    interface Servicio {
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
    }

    const ServiciosSection: React.FC = () => {
        const queryClient = useQueryClient();
        const { toast } = useToast();
        const [editing, setEditing] = useState<Servicio | null>(null);

        // 1. Consulta todos los servicios
        const { data, isLoading, error } = useQuery<Servicio[]>({
            queryKey: ["servicios"],
            queryFn: () => API.get("/servicios").then(r => r.data),
        });

        // 2. Mutación de borrado
        const deleteServicio = useMutation({
            mutationFn: (id: number) => API.delete(`/servicios/${id}`),
            onSuccess: () => {
                toast({ title: "Eliminado", description: "Servicio borrado" });
                queryClient.invalidateQueries({ queryKey: ["servicios"] });
            },
            onError: () => {
                toast({ title: "Error", description: "No se pudo borrar", variant: "destructive" });
            },
        });

        if (isLoading) return <p>Cargando servicios…</p>;
        if (error) return <p>Error al cargar servicios.</p>;

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Lista de Servicios</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((s: Servicio) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.nombre}</TableCell>
                                <TableCell>{s.descripcion}</TableCell>
                                <TableCell>{s.precio.toLocaleString()}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button size="sm" onClick={() => setEditing(s)}>
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteServicio.mutate(s.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Modal de edición: reutiliza el componente de registro pasando los datos */}
                {editing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
                            <ServiciosRegister
                                servicio={editing}
                                onSuccess={() => {
                                    setEditing(null);
                                    queryClient.invalidateQueries({ queryKey: ["servicios"] });
                                }}
                                onCancel={() => setEditing(null)}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default ServiciosSection;
