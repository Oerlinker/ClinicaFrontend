import React, { useState } from "react";
        import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
        import API from "../services/api";
        import { Button } from "../components/ui/button";
        import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
        import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
        import { Input } from "../components/ui/input";
        import { useToast } from "../hooks/use-toast";

        interface Role {
            id: number;
            nombre: string;
        }

        const AdminDashboardContent: React.FC = () => {
            const queryClient = useQueryClient();
            const { toast } = useToast();

            const { data: roles, isLoading, error } = useQuery<Role[]>({
                queryKey: ["roles"],
                queryFn: async () => {
                    const response = await API.get("/roles");
                    return response.data;
                },
            });


            const deleteRoleMutation = useMutation({
                mutationFn: async (id: number) => {
                    await API.delete(`/roles/${id}`);
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["roles"] });
                    toast({
                        title: "Rol eliminado",
                        description: "El rol ha sido eliminado exitosamente.",
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error al eliminar rol",
                        description: error.message || "Ocurrió un error al eliminar el rol.",
                        variant: "destructive",
                    });
                },
            });

            const createRoleMutation = useMutation({
                mutationFn: async (newRole: { nombre: string }) => {
                    const response = await API.post("/roles", newRole);
                    return response.data;
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["roles"] });
                    setNewRoleName("");
                    setShowCreateForm(false);
                    toast({
                        title: "Rol creado",
                        description: "El rol ha sido creado exitosamente.",
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error al crear rol",
                        description: error.message || "Ocurrió un error al crear el rol.",
                        variant: "destructive",
                    });
                },
            });

            const updateRoleMutation = useMutation({
                mutationFn: async (role: Role) => {
                    const response = await API.put(`/roles/${role.id}`, role);
                    return response.data;
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["roles"] });
                    setEditingRole(null);
                    toast({
                        title: "Rol actualizado",
                        description: "El rol ha sido actualizado exitosamente.",
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error al actualizar rol",
                        description: error.message || "Ocurrió un error al actualizar el rol.",
                        variant: "destructive",
                    });
                },
            });


            const [showCreateForm, setShowCreateForm] = useState(false);
            const [newRoleName, setNewRoleName] = useState("");
            const [editingRole, setEditingRole] = useState<Role | null>(null);
            const [editingRoleName, setEditingRoleName] = useState("");

            if (isLoading) return <div>Cargando roles...</div>;
            if (error) return <div>Error al cargar roles</div>;

            const handleEditClick = (role: Role) => {
                setEditingRole(role);
                setEditingRoleName(role.nombre);
            };

            const handleUpdate = () => {
                if (editingRole) {
                    updateRoleMutation.mutate({ ...editingRole, nombre: editingRoleName });
                }
            };

            return (
                <div>
                    <div className="mb-4">
                        <Button onClick={() => setShowCreateForm(true)}>Agregar Rol</Button>
                        {showCreateForm && (
                            <div className="mt-2 flex items-center space-x-2">
                                <Input
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="Nombre del nuevo rol"
                                />
                                <Button onClick={() => createRoleMutation.mutate({ nombre: newRoleName })}>
                                    Crear
                                </Button>
                                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles?.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>{role.id}</TableCell>
                                            <TableCell>
                                                {editingRole && editingRole.id === role.id ? (
                                                    <Input
                                                        value={editingRoleName}
                                                        onChange={(e) => setEditingRoleName(e.target.value)}
                                                    />
                                                ) : (
                                                    role.nombre
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingRole && editingRole.id === role.id ? (
                                                    <>
                                                        <Button variant="outline" className="mr-2" onClick={handleUpdate}>
                                                            Guardar
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setEditingRole(null)}>
                                                            Cancelar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="outline" className="mr-2" onClick={() => handleEditClick(role)}>
                                                            Editar
                                                        </Button>
                                                        <Button variant="outline" onClick={() => deleteRoleMutation.mutate(role.id)}>
                                                            Eliminar
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            );
        };

        export default AdminDashboardContent;
