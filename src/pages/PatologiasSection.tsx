import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import API from "../services/api";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../components/ui/table";
import {Button} from "../components/ui/button";
import {useToast} from "../hooks/use-toast";
import PatologiasRegister from "./PatologiasRegister";

interface Patologia {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
}

const PatologiasSection: React.FC = () => {
    const queryClient = useQueryClient();
    const {toast} = useToast();
    const [editing, setEditing] = useState<Patologia | null>(null);

    // 1. Cargar todas las patologías
    const {data, isLoading, error} = useQuery<Patologia[]>({
        queryKey: ["patologias"],
        queryFn: () => API.get("/patologias").then(r => r.data)
    });

    // 2. Mutación de borrado
    const deleteMutation = useMutation({
        mutationFn: (id: number) => API.delete(`/patologias/${id}`),
        onSuccess: () => {
            toast({title: "Eliminado", description: "Patología borrada."});
            queryClient.invalidateQueries({queryKey: ["patologias"]});
        },
        onError: () => {
            toast({title: "Error", description: "No se pudo borrar", variant: "destructive"});
        },
    });

    if (isLoading) return <p>Cargando patologías…</p>;
    if (error) return <p>Error al cargar patologías.</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lista de Patologías</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>{p.codigo}</TableCell>
                            <TableCell>{p.nombre}</TableCell>
                            <TableCell>{p.descripcion}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button size="sm" onClick={() => setEditing(p)}>
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteMutation.mutate(p.id)}
                                >
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal de edición */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
                        <PatologiasRegister
                            patologia={editing}
                            onSuccess={() => {
                                setEditing(null);
                                queryClient.invalidateQueries({queryKey: ["patologias"]});
                            }}
                            onCancel={() => setEditing(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatologiasSection;
