import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import tratamientoService, {
  Tratamiento,
  TratamientoDTO,
  MedicamentoTratamientoDTO
} from "../services/tratamientoService";
import medicamentoService, { Medicamento } from "../services/medicamentoService";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Pencil, Trash2, Plus, Calendar } from "lucide-react";

const AdminTratamientosDashboard: React.FC = () => {
  const { toast } = useToast();
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTratamientoDialogOpen, setIsTratamientoDialogOpen] = useState(false);
  const [isMedicamentoDialogOpen, setIsMedicamentoDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTratamiento, setCurrentTratamiento] = useState<Tratamiento | null>(null);
  const [currentTratamientoId, setCurrentTratamientoId] = useState<number | null>(null);

  const [tratamientoFormData, setTratamientoFormData] = useState<TratamientoDTO>({
    nombre: "",
    atencionId: 0,
    descripcion: "",
    duracionDias: 0,
    fechaInicio: "",
    fechaFin: "",
    observaciones: ""
  });

  const [medicamentoFormData, setMedicamentoFormData] = useState<MedicamentoTratamientoDTO>({
    medicamentoId: 0,
    dosis: "",
    unidadMedida: "",
    frecuencia: "",
    duracionDias: 0,
    viaAdministracion: "",
    instrucciones: ""
  });

  useEffect(() => {
    loadTratamientos();
    loadMedicamentos();
  }, []);

  const loadTratamientos = async () => {
    setIsLoading(true);
    try {
      const response = await tratamientoService.getAllTratamientos();
      setTratamientos(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedicamentos = async () => {
    try {
      const response = await medicamentoService.getAllMedicamentos();
      setMedicamentos(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los medicamentos",
        variant: "destructive",
      });
    }
  };

  const handleTratamientoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTratamientoFormData({
      ...tratamientoFormData,
      [name]: ["atencionId", "duracionDias"].includes(name) ? parseInt(value) : value,
    });
  };

  const handleMedicamentoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMedicamentoFormData({
      ...medicamentoFormData,
      [name]: ["medicamentoId", "duracionDias"].includes(name)
        ? parseInt(value)
        : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setMedicamentoFormData({
      ...medicamentoFormData,
      [name]: name === "medicamentoId" ? parseInt(value) : value,
    });
  };

  const resetTratamientoForm = () => {
    setTratamientoFormData({
      nombre: "",
      atencionId: 0,
      descripcion: "",
      duracionDias: 0,
      fechaInicio: "",
      fechaFin: "",
      observaciones: ""
    });
    setIsEditing(false);
    setCurrentTratamiento(null);
  };

  const resetMedicamentoForm = () => {
    setMedicamentoFormData({
      medicamentoId: 0,
      dosis: "",
      unidadMedida: "",
      frecuencia: "",
      duracionDias: 0,
      viaAdministracion: "",
      instrucciones: ""
    });
  };

  const openAddTratamientoDialog = () => {
    resetTratamientoForm();
    setIsTratamientoDialogOpen(true);
  };

  const openEditTratamientoDialog = (tratamiento: Tratamiento) => {
    setIsEditing(true);
    setCurrentTratamiento(tratamiento);
    setTratamientoFormData({
      nombre: tratamiento.nombre,
      atencionId: tratamiento.atencionId,
      descripcion: tratamiento.descripcion,
      duracionDias: tratamiento.duracionDias,
      fechaInicio: tratamiento.fechaInicio,
      fechaFin: tratamiento.fechaFin,
      observaciones: tratamiento.observaciones || ""
    });
    setIsTratamientoDialogOpen(true);
  };

  const openAddMedicamentoDialog = (tratamientoId: number) => {
    resetMedicamentoForm();
    setCurrentTratamientoId(tratamientoId);
    setIsMedicamentoDialogOpen(true);
  };

  const handleTratamientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentTratamiento) {
        await tratamientoService.updateTratamiento(currentTratamiento.id, tratamientoFormData);
        toast({
          title: "Éxito",
          description: "Tratamiento actualizado correctamente",
        });
      } else {
        await tratamientoService.createTratamiento(tratamientoFormData);
        toast({
          title: "Éxito",
          description: "Tratamiento creado correctamente",
        });
      }

      setIsTratamientoDialogOpen(false);
      loadTratamientos();
      resetTratamientoForm();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing
          ? "No se pudo actualizar el tratamiento"
          : "No se pudo crear el tratamiento",
        variant: "destructive",
      });
    }
  };

  const handleMedicamentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTratamientoId) return;

    try {
      await tratamientoService.addMedicamentoToTratamiento(
        currentTratamientoId,
        medicamentoFormData
      );

      toast({
        title: "Éxito",
        description: "Medicamento añadido al tratamiento correctamente",
      });

      setIsMedicamentoDialogOpen(false);

      // Recargar solo el tratamiento actualizado
      const response = await tratamientoService.getTratamientoById(currentTratamientoId);
      const updatedTratamiento = response.data;

      setTratamientos(prevTratamientos =>
        prevTratamientos.map(t =>
          t.id === updatedTratamiento.id ? updatedTratamiento : t
        )
      );

      resetMedicamentoForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el medicamento al tratamiento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTratamiento = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este tratamiento?")) {
      try {
        await tratamientoService.deleteTratamiento(id);
        toast({
          title: "Éxito",
          description: "Tratamiento eliminado correctamente",
        });
        loadTratamientos();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el tratamiento",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteMedicamento = async (tratamientoId: number, medicamentoTratamientoId: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este medicamento del tratamiento?")) {
      try {
        await tratamientoService.removeMedicamentoFromTratamiento(
          tratamientoId,
          medicamentoTratamientoId
        );

        toast({
          title: "Éxito",
          description: "Medicamento eliminado del tratamiento correctamente",
        });

        // Recargar solo el tratamiento actualizado
        const response = await tratamientoService.getTratamientoById(tratamientoId);
        const updatedTratamiento = response.data;

        setTratamientos(prevTratamientos =>
          prevTratamientos.map(t =>
            t.id === updatedTratamiento.id ? updatedTratamiento : t
          )
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el medicamento del tratamiento",
          variant: "destructive",
        });
      }
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Tratamientos</h1>

      <div className="flex justify-end items-center mb-6">
        <Button onClick={openAddTratamientoDialog}>Agregar Tratamiento</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Cargando...</div>
      ) : tratamientos.length === 0 ? (
        <div className="text-center py-10">No hay tratamientos disponibles</div>
      ) : (
        <Accordion type="single" collapsible className="mb-6">
          {tratamientos.map((tratamiento) => (
            <AccordionItem key={tratamiento.id} value={`tratamiento-${tratamiento.id}`}>
              <AccordionTrigger className="px-4 py-2 bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tratamiento #{tratamiento.id}</span>
                    <span className="text-sm text-gray-600">
                      - Atención #{tratamiento.atencionId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatFecha(tratamiento.fechaInicio)} - {formatFecha(tratamiento.fechaFin)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Detalles del Tratamiento</h3>
                  <p><strong>Nombre:</strong> {tratamiento.nombre}</p>
                  <p><strong>Descripción:</strong> {tratamiento.descripcion}</p>
                  <p><strong>Duración (días):</strong> {tratamiento.duracionDias}</p>
                  <p><strong>Fecha Inicio:</strong> {formatFecha(tratamiento.fechaInicio)}</p>
                  <p><strong>Fecha Fin:</strong> {formatFecha(tratamiento.fechaFin)}</p>
                  {tratamiento.observaciones && (
                    <p><strong>Observaciones:</strong> {tratamiento.observaciones}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditTratamientoDialog(tratamiento)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Editar Tratamiento
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteTratamiento(tratamiento.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar Tratamiento
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Medicamentos Asignados</h3>
                    <Button
                      size="sm"
                      onClick={() => openAddMedicamentoDialog(tratamiento.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Añadir Medicamento
                    </Button>
                  </div>

                  {tratamiento.medicamentos &&
                   tratamiento.medicamentos.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicamento</TableHead>
                          <TableHead>Dosis</TableHead>
                          <TableHead>Frecuencia</TableHead>
                          <TableHead>Duración (días)</TableHead>
                          <TableHead>Vía</TableHead>
                          <TableHead>Instrucciones</TableHead>
                          <TableHead className="w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tratamiento.medicamentos.map((med) => (
                          <TableRow key={med.id}>
                            <TableCell>{med.nombreMedicamento}</TableCell>
                            <TableCell>{med.dosis} {med.unidadMedida}</TableCell>
                            <TableCell>{med.frecuencia}</TableCell>
                            <TableCell>{med.duracionDias}</TableCell>
                            <TableCell>{med.viaAdministracion}</TableCell>
                            <TableCell>{med.instrucciones}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteMedicamento(tratamiento.id, med.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 italic">No hay medicamentos asignados a este tratamiento</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Diálogo para añadir/editar tratamiento */}
      <Dialog open={isTratamientoDialogOpen} onOpenChange={setIsTratamientoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Tratamiento" : "Agregar Nuevo Tratamiento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTratamientoSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="atencionId">ID de la Atención</Label>
                <Input
                  id="atencionId"
                  name="atencionId"
                  type="number"
                  value={tratamientoFormData.atencionId}
                  onChange={handleTratamientoInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre del Tratamiento</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={tratamientoFormData.nombre}
                  onChange={handleTratamientoInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={tratamientoFormData.descripcion}
                  onChange={handleTratamientoInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duracionDias">Duración (días)</Label>
                  <Input
                    id="duracionDias"
                    name="duracionDias"
                    type="number"
                    min="1"
                    value={tratamientoFormData.duracionDias}
                    onChange={handleTratamientoInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <div className="flex">
                    <Input
                      id="fechaInicio"
                      name="fechaInicio"
                      type="date"
                      value={tratamientoFormData.fechaInicio}
                      onChange={handleTratamientoInputChange}
                      required
                    />
                    <Calendar className="h-4 w-4 ml-2 mt-3" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <div className="flex">
                    <Input
                      id="fechaFin"
                      name="fechaFin"
                      type="date"
                      value={tratamientoFormData.fechaFin}
                      onChange={handleTratamientoInputChange}
                      required
                    />
                    <Calendar className="h-4 w-4 ml-2 mt-3" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={tratamientoFormData.observaciones}
                  onChange={handleTratamientoInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsTratamientoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para añadir medicamento al tratamiento */}
      <Dialog open={isMedicamentoDialogOpen} onOpenChange={setIsMedicamentoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Añadir Medicamento al Tratamiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMedicamentoSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="medicamentoId">Medicamento</Label>
                <Select
                  name="medicamentoId"
                  value={medicamentoFormData.medicamentoId.toString()}
                  onValueChange={(value) => handleSelectChange("medicamentoId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar medicamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicamentos.map(med => (
                      <SelectItem key={med.id} value={med.id.toString()}>
                        {med.nombre} - {med.fabricante}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dosis">Dosis</Label>
                  <Input
                    id="dosis"
                    name="dosis"
                    type="text"
                    value={medicamentoFormData.dosis}
                    onChange={handleMedicamentoInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                  <Select
                    name="unidadMedida"
                    value={medicamentoFormData.unidadMedida}
                    onValueChange={(value) => handleSelectChange("unidadMedida", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gotas">Gotas</SelectItem>
                      <SelectItem value="tabletas">Tabletas</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frecuencia">Frecuencia</Label>
                <Input
                  id="frecuencia"
                  name="frecuencia"
                  placeholder="Ej: Cada 8 horas, 1 vez al día"
                  value={medicamentoFormData.frecuencia}
                  onChange={handleMedicamentoInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duracionDias">Duración (días)</Label>
                  <Input
                    id="duracionDias"
                    name="duracionDias"
                    type="number"
                    min="1"
                    value={medicamentoFormData.duracionDias}
                    onChange={handleMedicamentoInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="viaAdministracion">Vía de Administración</Label>
                  <Select
                    name="viaAdministracion"
                    value={medicamentoFormData.viaAdministracion}
                    onValueChange={(value) => handleSelectChange("viaAdministracion", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Oftálmica">Oftálmica</SelectItem>
                      <SelectItem value="Tópica">Tópica</SelectItem>
                      <SelectItem value="Intravenosa">Intravenosa</SelectItem>
                      <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                      <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instrucciones">Instrucciones Específicas</Label>
                <Textarea
                  id="instrucciones"
                  name="instrucciones"
                  value={medicamentoFormData.instrucciones}
                  onChange={handleMedicamentoInputChange}
                  placeholder="Ej: Aplicar después de las comidas, usar con el estómago vacío..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsMedicamentoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Añadir Medicamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTratamientosDashboard;
