import { FormEvent, useEffect, useState, useRef } from "react";
import API from "../../services/api";
import { useToast } from "../../hooks/use-toast";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";
import medicamentoService, { Medicamento } from "../../services/medicamentoService";
import { MedicamentoTratamientoDTO } from "../../services/tratamientoService";
import { cn } from "../../lib/utils";

interface AtencionFormProps {
    citaId: number;
    onSuccess: () => void;
}

interface Patologia {
    id: number;
    nombre: string;
}

interface TratamientoFormData {
    nombre: string;
    descripcion: string;
    duracionDias: number;
    fechaInicio: string;
    fechaFin: string;
    observaciones: string;
    medicamentos: MedicamentoTratamientoDTO[];
}

export default function AtencionForm({ citaId, onSuccess }: AtencionFormProps) {
    const { toast } = useToast();
    const [motivo, setMotivo] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [patologiaId, setPatologiaId] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);

    // Referencias para el desplazamiento
    const formContainerRef = useRef<HTMLDivElement>(null);
    const guardarBtnRef = useRef<HTMLButtonElement>(null);
    const inicioFormRef = useRef<HTMLDivElement>(null);

    // Para el tratamiento estructurado
    const [showTratamientoForm, setShowTratamientoForm] = useState(false);
    const [tratamientoForm, setTratamientoForm] = useState<TratamientoFormData>({
        nombre: "",
        descripcion: "",
        duracionDias: 7,
        fechaInicio: new Date().toISOString().split("T")[0],
        fechaFin: "",
        observaciones: "",
        medicamentos: [],
    });

    // Medicamentos disponibles y auxiliar para nuevo medicamento
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [nuevoMedicamento, setNuevoMedicamento] = useState<MedicamentoTratamientoDTO>({
        medicamentoId: 0,
        dosis: "",
        unidadMedida: "",
        frecuencia: "",
        duracionDias: 7,
        viaAdministracion: "",
        instrucciones: "",
    });

    useEffect(() => {
        // Carga de patologías
        API.get<Patologia[]>("/patologias")
            .then(res => setPatologias(res.data))
            .catch(() =>
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las patologías.",
                    variant: "destructive",
                })
            );

        medicamentoService
            .getAllMedicamentos()
            .then(res => setMedicamentos(res.data))
            .catch(() =>
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los medicamentos.",
                    variant: "destructive",
                })
            );

        // Fecha fin por defecto (7 días después de fecha inicio)
        const inicio = new Date();
        const fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 7);
        setTratamientoForm(tf => ({
            ...tf,
            fechaFin: fin.toISOString().split("T")[0],
        }));
    }, [toast]);

    // Manejo de cambios en el subformulario de Tratamiento
    const handleTratamientoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setTratamientoForm(tf => ({
            ...tf,
            [name]: name === "duracionDias" ? parseInt(value) : value,
        }));
    };

    // Manejo de cambios en el subformulario de Nuevo Medicamento
    const handleNuevoMedicamentoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setNuevoMedicamento(nm => ({
            ...nm,
            [name]: ["medicamentoId", "duracionDias"].includes(name)
                ? parseInt(value)
                : value,
        }));
    };

    // Agregar medicamento al tratamiento
    const agregarMedicamento = () => {
        if (nuevoMedicamento.medicamentoId === 0) {
            toast({
                title: "Error",
                description: "Debe seleccionar un medicamento",
                variant: "destructive",
            });
            return;
        }
        setTratamientoForm(tf => ({
            ...tf,
            medicamentos: [...tf.medicamentos, nuevoMedicamento],
        }));
        setNuevoMedicamento({
            medicamentoId: 0,
            dosis: "",
            unidadMedida: "",
            frecuencia: "",
            duracionDias: 7,
            viaAdministracion: "",
            instrucciones: "",
        });
    };

    // Eliminar medicamento del tratamiento
    const eliminarMedicamento = (index: number) => {
        setTratamientoForm(tf => {
            const meds = [...tf.medicamentos];
            meds.splice(index, 1);
            return { ...tf, medicamentos: meds };
        });
    };

    // Funciones para el desplazamiento
    const scrollToGuardar = () => {
        guardarBtnRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToInicio = () => {
        inicioFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };



    // Envío del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const payload: any = {
            citaId,
            motivo,
            diagnostico,
            observaciones,
        };
        if (patologiaId !== "") payload.patologiaId = patologiaId;

        if (
            showTratamientoForm &&
            tratamientoForm.nombre &&
            tratamientoForm.descripcion
        ) {
            payload.tratamientos = [
                {
                    nombre: tratamientoForm.nombre,
                    descripcion: tratamientoForm.descripcion,
                    duracionDias: tratamientoForm.duracionDias,
                    fechaInicio: tratamientoForm.fechaInicio,
                    fechaFin: tratamientoForm.fechaFin,
                    observaciones: tratamientoForm.observaciones,
                    medicamentos: tratamientoForm.medicamentos,
                },
            ];
        }

        try {
            await API.post("/atenciones", payload);
            toast({
                title: "Atención registrada",
                description: "Se registró la atención exitosamente.",
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || "Error al registrar la atención");
        }
    };

    return (
      <div
        ref={formContainerRef}
        className={cn(
          "mx-auto max-w-4xl overflow-y-auto overflow-x-hidden bg-white p-6 rounded-lg shadow-lg",
          showTratamientoForm ? "max-h-[80vh]" : "max-h-[calc(100vh-8rem)]"
        )}
      >
           <div ref={inicioFormRef}></div>
           <form onSubmit={handleSubmit} className="space-y-6 pb-32">
              <h3 className="text-2xl font-semibold">Registrar Atención</h3>

              {/* Motivo y diagnóstico en grid para aprovechar ancho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Motivo:</label>
                  <input
                    type="text"
                    required
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Diagnóstico:</label>
                  <textarea
                    required
                    value={diagnostico}
                    onChange={e => setDiagnostico(e.target.value)}
                    className="w-full border rounded p-2 h-24"
                  />
                </div>
              </div>

              {/* Toggle para tratamiento estructurado */}
              <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded">
                <Checkbox
                    id="showTratamientoForm"
                    checked={showTratamientoForm}
                    onCheckedChange={c => setShowTratamientoForm(c === true)}
                />
                <label htmlFor="showTratamientoForm" className="select-none font-medium">
                    Crear tratamiento estructurado
                </label>
              </div>

              {/* Subform Tratamiento: scroll interno y altura fija */}
              {showTratamientoForm && (
                <div
                  className="
                    border rounded p-4 space-y-4 bg-gray-50 shadow-sm
                    max-h-[50vh] overflow-y-auto
                  "
                >
                    <h4 className="font-semibold text-lg border-b pb-2">
                      Detalles del Tratamiento
                    </h4>

                    {/* Botón "Ir a guardar" pegado arriba */}
                    <div className="sticky top-0 z-10 bg-gray-50 pt-2 pb-4 text-right">
                      <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={scrollToGuardar}
                          className="mb-2"
                      >
                          Ir a guardar
                      </Button>
                    </div>

                    {/* Nombre y Descripción */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1">Nombre:</label>
                            <input
                                name="nombre"
                                type="text"
                                required
                                value={tratamientoForm.nombre}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Descripción:</label>
                            <textarea
                                name="descripcion"
                                required
                                value={tratamientoForm.descripcion}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Duración y Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block mb-1">Duración (días):</label>
                            <input
                                name="duracionDias"
                                type="number"
                                required
                                min={1}
                                value={tratamientoForm.duracionDias}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Inicio:</label>
                            <input
                                name="fechaInicio"
                                type="date"
                                required
                                value={tratamientoForm.fechaInicio}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Fin:</label>
                            <input
                                name="fechaFin"
                                type="date"
                                required
                                value={tratamientoForm.fechaFin}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block mb-1">Observaciones:</label>
                        <textarea
                            name="observaciones"
                            value={tratamientoForm.observaciones}
                            onChange={handleTratamientoChange}
                            className="w-full border rounded p-2"
                            rows={2}
                        />
                    </div>

                    {/* Medicamentos dentro del Tratamiento */}
                    <div className="space-y-3 border-t pt-3">
                        <h5 className="font-medium text-blue-600">Agregar Medicamento</h5>

                        {/* Selección y Dosis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm">Medicamento:</label>
                                <select
                                    name="medicamentoId"
                                    value={nuevoMedicamento.medicamentoId}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2 bg-white"
                                >
                                    <option value={0}>-- Seleccionar --</option>
                                    {medicamentos.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nombre} ({m.fabricante})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block mb-1 text-sm">Dosis:</label>
                                    <input
                                        name="dosis"
                                        type="text"
                                        value={nuevoMedicamento.dosis}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
                                        placeholder="Ej: 1 gota"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm">Unidad:</label>
                                    <select
                                        name="unidadMedida"
                                        value={nuevoMedicamento.unidadMedida}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2 bg-white"
                                    >
                                        <option value="">-- --</option>
                                        <option value="gotas">Gotas</option>
                                        <option value="tabletas">Tabletas</option>
                                        <option value="ml">ml</option>
                                        <option value="mg">mg</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Frecuencia, Duración y Vía */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1 text-sm">Frecuencia:</label>
                                <input
                                    name="frecuencia"
                                    type="text"
                                    value={nuevoMedicamento.frecuencia}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2"
                                    placeholder="Ej: Cada 8 h"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Duración (días):</label>
                                <input
                                    name="duracionDias"
                                    type="number"
                                    min={1}
                                    value={nuevoMedicamento.duracionDias}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm">Vía:</label>
                                <select
                                    name="viaAdministracion"
                                    value={nuevoMedicamento.viaAdministracion}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2 bg-white"
                                >
                                    <option value="">-- --</option>
                                    <option value="Oral">Oral</option>
                                    <option value="Oftálmica">Oftálmica</option>
                                    <option value="Tópica">Tópica</option>
                                    <option value="Intravenosa">Intravenosa</option>
                                </select>
                            </div>
                        </div>

                        {/* Instrucciones */}
                        <div>
                            <label className="block mb-1 text-sm">Instrucciones:</label>
                            <input
                                name="instrucciones"
                                type="text"
                                value={nuevoMedicamento.instrucciones}
                                onChange={handleNuevoMedicamentoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        {/* Botón Agregar */}
                        <Button type="button" onClick={agregarMedicamento} className="w-full mt-2">
                            Agregar al tratamiento
                        </Button>
                    </div>

                    {/* Lista de Medicamentos Agregados */}
                    {tratamientoForm.medicamentos.length > 0 && (
                        <div className="mt-4 border-t pt-3">
                            <h5 className="font-medium mb-2 text-green-600">Medicamentos en este tratamiento</h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-2 py-1 text-left">Medicamento</th>
                                        <th className="px-2 py-1 text-left">Dosis</th>
                                        <th className="px-2 py-1 text-left">Frecuencia</th>
                                        <th className="px-2 py-1 text-right">Acción</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                    {tratamientoForm.medicamentos.map((med, i) => {
                                        const m = medicamentos.find(x => x.id === med.medicamentoId);
                                        return (
                                            <tr key={i} className="border-b">
                                                <td className="px-2 py-1">{m?.nombre}</td>
                                                <td className="px-2 py-1">{med.dosis} {med.unidadMedida}</td>
                                                <td className="px-2 py-1">{med.frecuencia}</td>
                                                <td className="px-2 py-1 text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => eliminarMedicamento(i)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* Observaciones y Patología en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Observaciones:</label>
                  <textarea
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                      className="w-full border rounded p-2 h-24"
                  />
                </div>
                <div>
                  <label className="block mb-1">Patología (opcional):</label>
                  <select
                      value={patologiaId}
                      onChange={e => setPatologiaId(e.target.value === "" ? "" : +e.target.value)}
                      className="w-full border rounded p-2"
                  >
                      <option value="">-- Ninguna --</option>
                      {patologias.map(p => (
                          <option key={p.id} value={p.id}>
                              {p.nombre}
                          </option>
                      ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-600">{error}</p>}

              {/* Footer sticky */}
              <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t shadow-inner z-20">
                <Button
                    type="submit"
                    className="w-full"
                    ref={guardarBtnRef}
                >
                    Guardar Atención
                </Button>
              </div>
          </form>

          {/* Botón flotante para ir al inicio */}
          {showTratamientoForm && (
              <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="fixed bottom-32 right-4 rounded-full w-12 h-12 flex items-center justify-center"
                  onClick={scrollToInicio}
              >
                  ↑
              </Button>
          )}
      </div>
    );
}
