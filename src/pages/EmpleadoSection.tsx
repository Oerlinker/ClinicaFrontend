import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const EmpleadosSection: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: empleados, isLoading, error } = useQuery({
        queryKey: ["empleados"],
        queryFn: async () => {
            const response = await API.get("/empleados");
            return response.data;
        },
    });

    const deleteEmpleadoMutation = useMutation({
        mutationFn: async (id: number) => {
            await API.delete(`/empleados/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["empleados"] });
        },
    });

    if (isLoading) return <div>Cargando empleados...</div>;
    if (error) return <div>Error al cargar empleados</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Empleados</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Especialidad</TableHead>
                            <TableHead>Fecha Contratación</TableHead>
                            <TableHead>Salario</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {empleados?.map((empleado: any) => (
                            <TableRow key={empleado.id}>
                                <TableCell>
                                    {empleado.usuario.nombre} {empleado.usuario.apellido}
                                </TableCell>
                                <TableCell>{empleado.cargo}</TableCell>
                                <TableCell>{empleado.especialidad || "-"}</TableCell>
                                <TableCell>{empleado.fechaContratacion || "-"}</TableCell>
                                <TableCell>{empleado.salario ? `$${empleado.salario}` : "-"}</TableCell>
                                <TableCell>
                                    <Button variant="outline" className="mr-2">
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => deleteEmpleadoMutation.mutate(empleado.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default EmpleadosSection;
