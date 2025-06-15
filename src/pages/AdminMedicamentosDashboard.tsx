import React, { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import API from "../services/api";
import medicamentoService, { Medicamento, MedicamentoDTO } from "../services/medicamentoService";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Search, Pencil, Trash2 } from "lucide-react";

const AdminMedicamentosDashboard: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicamento, setCurrentMedicamento] = useState<Medicamento | null>(null);
  const [formData, setFormData] = useState<MedicamentoDTO>({
    nombre: "",
    descripcion: "",
    fabricante: "",
    efectosSecundarios: "",
  });

  // Consulta para obtener medicamentos
  const { data: medicamentos = [], isLoading } = useQuery<Medicamento[]>({
    queryKey: ["medicamentos"],
    queryFn: () => medicamentoService.getAllMedicamentos().then(res => res.data),
  });

  // Mutación para crear/actualizar medicamento
  const mutation = useMutation({
    mutationFn: async () => {
      if (isEditing && currentMedicamento) {
        return API.put(`/medicamentos/${currentMedicamento.id}`, formData);
      }
      return API.post("/medicamentos", formData);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Actualizado" : "Creado",
        description: `Medicamento ${isEditing ? "actualizado" : "creado"} correctamente.`,
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["medicamentos"] });
    },
    onError: (error: any) => {
      console.error("Error en la mutación:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el medicamento"
          : "No se pudo crear el medicamento",
        variant: "destructive"
      });
    },
  });

  // Mutación para eliminar medicamento
  const deleteMutation = useMutation({
    mutationFn: (id: number) => API.delete(`/medicamentos/${id}`),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Medicamento eliminado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ["medicamentos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el medicamento",
        variant: "destructive"
      });
    },
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      queryClient.invalidateQueries({ queryKey: ["medicamentos"] });
      return;
    }

    try {
      const response = await medicamentoService.buscarMedicamentosPorNombre(searchTerm);
      queryClient.setQueryData(["medicamentos"], response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al buscar medicamentos",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      fabricante: "",
      efectosSecundarios: "",
    });
    setIsEditing(false);
    setCurrentMedicamento(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (medicamento: Medicamento) => {
    setIsEditing(true);
    setCurrentMedicamento(medicamento);
    setFormData({
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion,
      fabricante: medicamento.fabricante,
      efectosSecundarios: medicamento.efectosSecundarios,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este medicamento?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Medicamentos</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleSearch} variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={openAddDialog}>Agregar Medicamento</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fabricante</TableHead>
            <TableHead>Efectos Secundarios</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
            </TableRow>
          ) : medicamentos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No hay medicamentos disponibles</TableCell>
            </TableRow>
          ) : (
            medicamentos.map((medicamento) => (
              <TableRow key={medicamento.id}>
                <TableCell>{medicamento.id}</TableCell>
                <TableCell>{medicamento.nombre}</TableCell>
                <TableCell>{medicamento.fabricante}</TableCell>
                <TableCell>{medicamento.efectosSecundarios}</TableCell>
                <TableCell>{medicamento.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => openEditDialog(medicamento)}
                      variant="outline"
                      size="icon"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(medicamento.id)}
                      variant="destructive"
                      size="icon"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="medicamento-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Medicamento" : "Agregar Nuevo Medicamento"}
            </DialogTitle>
            <DialogDescription id="medicamento-dialog-description">
              Complete el formulario para {isEditing ? "actualizar" : "crear"} un medicamento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fabricante">Fabricante</Label>
                <Input
                  id="fabricante"
                  name="fabricante"
                  value={formData.fabricante}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="efectosSecundarios">Efectos Secundarios</Label>
                <Textarea
                  id="efectosSecundarios"
                  name="efectosSecundarios"
                  value={formData.efectosSecundarios}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMedicamentosDashboard;
