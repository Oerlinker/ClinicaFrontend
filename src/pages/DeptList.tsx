import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import API from "../services/api";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

interface Departamento {
    id: number;
    nombre: string;
    descripcion: string;
}

interface DeptListProps {
    onEditDept?: (id: string) => void;
}

const DeptList: React.FC<DeptListProps> = ({ onEditDept }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery<Departamento[]>({
        queryKey: ["departamentos"],
        queryFn: () => API.get("/departamentos").then(res => res.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => API.delete(`/departamentos/${id}`),
        onSuccess: () => {
            toast({ title: "Departamento eliminado" });
            queryClient.invalidateQueries({ queryKey: ["departamentos"] });
        },
        onError: () => {
            toast({ title: "Error al eliminar", variant: "destructive" });
        }
    });

    if (isLoading) return <p>Cargando departamentos...</p>;
    if (error) return <p>Error al cargar departamentos</p>;

    return (
        <div className="p-6 bg-white rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Departamentos</h2>
                {onEditDept ? (
                    <Button onClick={() => onEditDept("nuevo")}>+ Nuevo Departamento</Button>
                ) : (
                    <Link to="/admin/departamentos/nuevo">
                        <Button>+ Nuevo Departamento</Button>
                    </Link>
                )}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data!.map(dept => (
                        <TableRow key={dept.id}>
                            <TableCell>{dept.id}</TableCell>
                            <TableCell>{dept.nombre}</TableCell>
                            <TableCell>{dept.descripcion}</TableCell>
                            <TableCell className="space-x-2">
                                {onEditDept ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onEditDept(dept.id.toString())}
                                    >
                                        Editar
                                    </Button>
                                ) : (
                                    <Link to={`/admin/departamentos/${dept.id}`}>
                                        <Button size="sm" variant="outline">Editar</Button>
                                    </Link>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteMutation.mutate(dept.id)}
                                >
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default DeptList;
