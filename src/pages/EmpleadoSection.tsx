import React, { useState } from "react";
        import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
        import API from "../services/api";
        import { Button } from "../components/ui/button";
        import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
        import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
        import { Input } from "../components/ui/input";

        const EmpleadosSection: React.FC = () => {
            const queryClient = useQueryClient();
            const [editingEmpleado, setEditingEmpleado] = useState<any | null>(null);
            const [formData, setFormData] = useState<any>({});

            const { data: empleados, isLoading, error } = useQuery({
                queryKey: ["empleados"],
                queryFn: async () => {
                    const response = await API.get("/empleados");
                    return response.data;
                },
            });

            const updateEmpleadoMutation = useMutation({
                mutationFn: async ({ id, data }: { id: number; data: any }) => {
                    const response = await API.put(`/empleados/${id}`, data);
                    return response.data;
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["empleados"] });
                    setEditingEmpleado(null);
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


            const handleEdit = (empleado: any) => {
                setEditingEmpleado(empleado);
                setFormData({
                    cargo: empleado.cargo,
                    especialidad: empleado.especialidad,
                    fechaContratacion: empleado.fechaContratacion,
                    salario: empleado.salario,
                });
            };

            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({
                    ...formData,
                    [e.target.id]: e.target.value,
                });
            };

            const handleSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                if (editingEmpleado) {
                    updateEmpleadoMutation.mutate({ id: editingEmpleado.id, data: formData });
                }
            };

            if (isLoading) return <div>Cargando empleados...</div>;
            if (error) return <div>Error al cargar empleados</div>;

            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Empleados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {editingEmpleado ? (
                            <form onSubmit={handleSubmit} className="mb-4">
                                <h2 className="text-xl font-bold mb-4">Editar Empleado</h2>
                                <div className="mb-4">
                                    <label htmlFor="especialidad">Especialidad</label>
                                    <Input id="especialidad" value={formData.especialidad} onChange={handleChange} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="fechaContratacion">Fecha de Contratación</label>
                                    <Input id="fechaContratacion" type="date" value={formData.fechaContratacion} onChange={handleChange} />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="salario">Salario</label>
                                    <Input id="salario" type="number" value={formData.salario} onChange={handleChange} />
                                </div>
                                <Button type="submit" className="mr-2">Guardar</Button>
                                <Button variant="outline" onClick={() => setEditingEmpleado(null)}>Cancelar</Button>
                            </form>
                        ) : (
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
                                            <TableCell>{empleado.cargo.nombre}</TableCell>
                                            <TableCell>{empleado.especialidad || "-"}</TableCell>
                                            <TableCell>{empleado.fechaContratacion || "-"}</TableCell>
                                            <TableCell>{empleado.salario ? `$${empleado.salario}` : "-"}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" className="mr-2" onClick={() => handleEdit(empleado)}>
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
                        )}
                    </CardContent>
                </Card>
            );
        };

        export default EmpleadosSection;