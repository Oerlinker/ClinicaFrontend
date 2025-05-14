import React, {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import API from "../services/api";
import {Button} from "../components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../components/ui/table";
import {Input} from "../components/ui/input";
import {useToast} from "../hooks/use-toast";

interface Especialidad {
    id: number;
    nombre: string;
}

type EmpleadoData = {
    id: number;
    usuario: { nombre: string; apellido: string };
    cargo: { id: number; nombre: string };
    especialidad?: { id: number; nombre: string } | null;
    departamento?: { id: number; nombre: string } | null;
    fechaContratacion?: string;
    salario?: number;
};

const EmpleadosSection: React.FC = () => {
    const queryClient = useQueryClient();
    const [editingEmpleado, setEditingEmpleado] = useState<EmpleadoData | null>(null);
    const [formData, setFormData] = useState<{ especialidadId: string; fechaContratacion?: string; salario?: string }>({
        especialidadId: "",
        fechaContratacion: "",
        salario: "",
    });
    const {toast} = useToast();

    const {data: empleados, isLoading, error} = useQuery<EmpleadoData[]>({
        queryKey: ["empleados"],
        queryFn: async () => {
            const response = await API.get("/empleados");
            return response.data;
        },
    });

    const {data: especialidades, isLoading: loadingEsp, error: errorEsp} = useQuery<Especialidad[]>({
        queryKey: ["especialidades"],
        queryFn: async () => {
            const res = await API.get("/especialidades");
            return res.data;
        },
    });

    const updateEmpleadoMutation = useMutation({
        mutationFn: async ({id, data}: { id: number; data: any }) => {
            const response = await API.put(`/empleados/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["empleados"]});
            setEditingEmpleado(null);
            toast({
                title: "Empleado actualizado",
                description: "El empleado ha sido actualizado exitosamente.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error al actualizar empleado",
                description: error.message || "Ocurrió un error al actualizar el empleado.",
                variant: "destructive",
            });
        },
    });

    const deleteEmpleadoMutation = useMutation({
        mutationFn: async (id: number) => {
            await API.delete(`/empleados/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["empleados"]});
            toast({
                title: "Empleado eliminado",
                description: "El empleado ha sido eliminado exitosamente.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error al eliminar empleado",
                description: error.message || "Ocurrió un error al eliminar el empleado.",
                variant: "destructive",
            });
        },
    });

    const handleEdit = (empleado: EmpleadoData) => {
        setEditingEmpleado(empleado);
        setFormData({
            especialidadId: empleado.especialidad?.id?.toString() || "",
            fechaContratacion: empleado.fechaContratacion || "",
            salario: empleado.salario?.toString() || "",
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmpleado) return;

        const payload = {
            cargo: editingEmpleado.cargo,
            especialidadId: formData.especialidadId ? Number(formData.especialidadId) : null,
            fechaContratacion: formData.fechaContratacion,
            salario: formData.salario,
        };
        updateEmpleadoMutation.mutate({id: editingEmpleado.id, data: payload});
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
                            <label htmlFor="especialidadId">Especialidad</label>
                            {loadingEsp ? (
                                <p>Cargando especialidades...</p>
                            ) : errorEsp ? (
                                <p>Error al cargar especialidades</p>
                            ) : (
                                <select
                                    id="especialidadId"
                                    value={formData.especialidadId}
                                    onChange={handleChange}
                                >
                                    <option value="">— sin especialidad —</option>
                                    {especialidades?.map((especialidad) => (
                                        <option key={especialidad.id} value={especialidad.id.toString()}>
                                            {especialidad.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="fechaContratacion">Fecha de Contratación</label>
                            <Input
                                id="fechaContratacion"
                                type="date"
                                value={formData.fechaContratacion}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="salario">Salario</label>
                            <Input
                                id="salario"
                                type="number"
                                value={formData.salario}
                                onChange={handleChange}
                            />
                        </div>
                        <Button type="submit" className="mr-2">
                            Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingEmpleado(null)}>
                            Cancelar
                        </Button>
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
                                <TableHead>Departamento</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {empleados?.map((empleado) => (
                                <TableRow key={empleado.id}>
                                    <TableCell>
                                        {empleado.usuario.nombre} {empleado.usuario.apellido}
                                    </TableCell>
                                    <TableCell>{empleado.cargo.nombre}</TableCell>
                                    <TableCell>
                                        {empleado.especialidad ? empleado.especialidad.nombre : "-"}
                                    </TableCell>
                                    <TableCell>{empleado.fechaContratacion || "-"}</TableCell>
                                    <TableCell>{empleado.salario ? `$${empleado.salario}` : "-"}</TableCell>
                                    <TableCell>
                                        {empleado.departamento?.nombre || "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            className="mr-2"
                                            onClick={() => handleEdit(empleado)}
                                        >
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
