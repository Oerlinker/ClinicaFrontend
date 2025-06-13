import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
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
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Search, Pencil, Trash2 } from "lucide-react";

const AdminMedicamentosDashboard: React.FC = () => {
  const { toast } = useToast();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicamento, setCurrentMedicamento] = useState<Medicamento | null>(null);
  const [formData, setFormData] = useState<MedicamentoDTO>({
    nombre: "",
    descripcion: "",
    formaFarmaceutica: "",
    concentracion: "",
  });

  useEffect(() => {
    loadMedicamentos();
  }, []);

  const loadMedicamentos = async () => {
    setIsLoading(true);
    try {
      const response = await medicamentoService.getAllMedicamentos();
      setMedicamentos(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los medicamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadMedicamentos();
      return;
    }

    setIsLoading(true);
    try {
      const response = await medicamentoService.buscarMedicamentosPorNombre(searchTerm);
      setMedicamentos(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al buscar medicamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      formaFarmaceutica: "",
      concentracion: "",
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
      formaFarmaceutica: medicamento.formaFarmaceutica,
      concentracion: medicamento.concentracion,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentMedicamento) {
        await medicamentoService.updateMedicamento(currentMedicamento.id, formData);
        toast({
          title: "Éxito",
          description: "Medicamento actualizado correctamente",
        });
      } else {
        await medicamentoService.createMedicamento(formData);
        toast({
          title: "Éxito",
          description: "Medicamento creado correctamente",
        });
      }

      setIsDialogOpen(false);
      loadMedicamentos();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el medicamento"
          : "No se pudo crear el medicamento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este medicamento?")) {
      try {
        await medicamentoService.deleteMedicamento(id);
        toast({
          title: "Éxito",
          description: "Medicamento eliminado correctamente",
        });
        loadMedicamentos();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el medicamento",
          variant: "destructive",
        });
      }
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
            <TableHead>Forma Farmacéutica</TableHead>
            <TableHead>Concentración</TableHead>
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
                <TableCell>{medicamento.formaFarmaceutica}</TableCell>
                <TableCell>{medicamento.concentracion}</TableCell>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Medicamento" : "Agregar Nuevo Medicamento"}
            </DialogTitle>
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
                <Label htmlFor="formaFarmaceutica">Forma Farmacéutica</Label>
                <Input
                  id="formaFarmaceutica"
                  name="formaFarmaceutica"
                  value={formData.formaFarmaceutica}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="concentracion">Concentración</Label>
                <Input
                  id="concentracion"
                  name="concentracion"
                  value={formData.concentracion}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
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
