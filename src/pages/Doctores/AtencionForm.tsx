// src/components/AtencionForm.tsx
import { FormEvent, useEffect, useState } from "react";
import API from "../../services/api";
import { useToast } from "../../hooks/use-toast";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";
import medicamentoService, { Medicamento } from "../../services/medicamentoService";
import { MedicamentoTratamientoDTO } from "../../services/tratamientoService";

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
    const [tratamiento, setTratamiento] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [patologiaId, setPatologiaId] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);
    const [showTratamientoForm, setShowTratamientoForm] = useState(false);
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

    // Estado para el formulario de tratamiento estructurado
    const [tratamientoForm, setTratamientoForm] = useState<TratamientoFormData>({
        nombre: "",
        descripcion: "",
        duracionDias: 7, // Valor predeterminado de una semana
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: "",
        observaciones: "",
        medicamentos: []
    });

    // Estado para un nuevo medicamento a agregar al tratamiento
    const [nuevoMedicamento, setNuevoMedicamento] = useState<MedicamentoTratamientoDTO>({
        medicamentoId: 0,
        dosis: "",
        unidadMedida: "",
        frecuencia: "",
        duracionDias: 7,
        viaAdministracion: "",
        instrucciones: ""
    });

    useEffect(() => {
        // Cargar patologías
        API.get<Patologia[]>("/patologias")
            .then(res => setPatologias(res.data))
            .catch(() => {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar las patologías.",
                    variant: "destructive",
                });
            });

        // Cargar medicamentos
        medicamentoService.getAllMedicamentos()
            .then(res => setMedicamentos(res.data))
            .catch(() => {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los medicamentos.",
                    variant: "destructive",
                });
            });

        // Calcular fecha fin por defecto (7 días después de la fecha inicio)
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaInicio.getDate() + 7);

        setTratamientoForm(prev => ({
            ...prev,
            fechaFin: fechaFin.toISOString().split('T')[0]
        }));
    }, [toast]);

    const handleTratamientoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTratamientoForm({
            ...tratamientoForm,
            [name]: ["duracionDias"].includes(name) ? parseInt(value) : value
        });
    };

    const handleNuevoMedicamentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevoMedicamento({
            ...nuevoMedicamento,
            [name]: ["medicamentoId", "duracionDias"].includes(name)
                ? parseInt(value)
                : value,
        });
    };

    const agregarMedicamento = () => {
        if (nuevoMedicamento.medicamentoId === 0) {
            toast({
                title: "Error",
                description: "Debe seleccionar un medicamento",
                variant: "destructive",
            });
            return;
        }

        setTratamientoForm({
            ...tratamientoForm,
            medicamentos: [...tratamientoForm.medicamentos, nuevoMedicamento]
        });

        // Resetear el formulario de nuevo medicamento
        setNuevoMedicamento({
            medicamentoId: 0,
            dosis: "",
            unidadMedida: "",
            frecuencia: "",
            duracionDias: 7,
            viaAdministracion: "",
            instrucciones: ""
        });
    };

    const eliminarMedicamento = (index: number) => {
        const nuevosMedicamentos = [...tratamientoForm.medicamentos];
        nuevosMedicamentos.splice(index, 1);
        setTratamientoForm({
            ...tratamientoForm,
            medicamentos: nuevosMedicamentos
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const payload: any = {
            citaId,
            motivo,
            diagnostico,
            tratamiento,
            observaciones,
        };

        if (patologiaId !== "") {
            payload.patologiaId = patologiaId;
        }

        // Si se está creando un tratamiento estructurado
        if (showTratamientoForm && tratamientoForm.nombre && tratamientoForm.descripcion) {
            payload.tratamientos = [
                {
                    nombre: tratamientoForm.nombre,
                    descripcion: tratamientoForm.descripcion,
                    duracionDias: tratamientoForm.duracionDias,
                    fechaInicio: tratamientoForm.fechaInicio,
                    fechaFin: tratamientoForm.fechaFin,
                    observaciones: tratamientoForm.observaciones,
                    medicamentos: tratamientoForm.medicamentos
                }
            ];
        }

        try {
            console.log("Enviando datos de atención:", payload);
            await API.post("/atenciones", payload);
            toast({
                title: "Atención registrada",
                description: "Se registró la atención exitosamente.",
            });
            onSuccess();
        } catch (err: any) {
            console.error("Error al registrar atención:", err);
            setError(err.response?.data?.message || "Error al registrar la atención");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Registrar Atención</h2>

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

            {/* Diagnóstico */}
            <div>
                <label className="block mb-1">Diagnóstico:</label>
                <textarea
                    required
                    value={diagnostico}
                    onChange={e => setDiagnostico(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Tratamiento (formato antiguo) */}
            <div>
                <label className="block mb-1">Tratamiento (texto):</label>
                <textarea
                    required={!showTratamientoForm}
                    value={tratamiento}
                    onChange={e => setTratamiento(e.target.value)}
                    className="w-full border rounded p-2"
                    disabled={showTratamientoForm}
                />
            </div>

            {/* Toggle para mostrar formulario de tratamiento estructurado */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="showTratamientoForm"
                    checked={showTratamientoForm}
                    onCheckedChange={(checked) => {
                        setShowTratamientoForm(checked === true);
                        if (checked === true) {
                            setTratamiento("Ver tratamiento estructurado");
                        } else {
                            setTratamiento("");
                        }
                    }}
                />
                <label
                    htmlFor="showTratamientoForm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Crear tratamiento estructurado
                </label>
            </div>

            {/* Formulario de tratamiento estructurado */}
            {showTratamientoForm && (
                <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-medium">Nuevo Tratamiento</h3>

                    <div>
                        <label className="block mb-1">Nombre del Tratamiento:</label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            value={tratamientoForm.nombre}
                            onChange={handleTratamientoChange}
                            className="w-full border rounded p-2"
                            placeholder="Ej: Tratamiento para glaucoma"
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
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1">Duración (días):</label>
                            <input
                                type="number"
                                name="duracionDias"
                                required
                                min="1"
                                value={tratamientoForm.duracionDias}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Inicio:</label>
                            <input
                                type="date"
                                name="fechaInicio"
                                required
                                value={tratamientoForm.fechaInicio}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Fin:</label>
                            <input
                                type="date"
                                name="fechaFin"
                                required
                                value={tratamientoForm.fechaFin}
                                onChange={handleTratamientoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1">Observaciones:</label>
                        <textarea
                            name="observaciones"
                            value={tratamientoForm.observaciones}
                            onChange={handleTratamientoChange}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-md font-medium mb-2">Agregar Medicamentos</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block mb-1">Medicamento:</label>
                                    <select
                                        name="medicamentoId"
                                        value={nuevoMedicamento.medicamentoId}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Seleccionar medicamento</option>
                                        {medicamentos.map(med => (
                                            <option key={med.id} value={med.id}>
                                                {med.nombre} - {med.fabricante}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block mb-1">Dosis:</label>
                                        <input
                                            type="text"
                                            name="dosis"
                                            value={nuevoMedicamento.dosis}
                                            onChange={handleNuevoMedicamentoChange}
                                            className="w-full border rounded p-2"
                                            placeholder="Ej: 1, 2.5, 5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">Unidad:</label>
                                        <select
                                            name="unidadMedida"
                                            value={nuevoMedicamento.unidadMedida}
                                            onChange={handleNuevoMedicamentoChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="gotas">Gotas</option>
                                            <option value="tabletas">Tabletas</option>
                                            <option value="ml">ml</option>
                                            <option value="mg">mg</option>
                                            <option value="unidades">Unidades</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block mb-1">Frecuencia:</label>
                                    <input
                                        type="text"
                                        name="frecuencia"
                                        placeholder="Ej: Cada 8 horas"
                                        value={nuevoMedicamento.frecuencia}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Duración (días):</label>
                                    <input
                                        type="number"
                                        name="duracionDias"
                                        value={nuevoMedicamento.duracionDias}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Vía:</label>
                                    <select
                                        name="viaAdministracion"
                                        value={nuevoMedicamento.viaAdministracion}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Oral">Oral</option>
                                        <option value="Oftálmica">Oftálmica</option>
                                        <option value="Tópica">Tópica</option>
                                        <option value="Intravenosa">Intravenosa</option>
                                        <option value="Intramuscular">Intramuscular</option>
                                        <option value="Subcutánea">Subcutánea</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1">Instrucciones:</label>
                                <input
                                    type="text"
                                    name="instrucciones"
                                    placeholder="Instrucciones específicas"
                                    value={nuevoMedicamento.instrucciones}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={agregarMedicamento}
                                className="w-full mt-2"
                            >
                                Agregar medicamento al tratamiento
                            </Button>
                        </div>

                        {/* Lista de medicamentos agregados */}
                        {tratamientoForm.medicamentos.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-md font-medium mb-2">Medicamentos en el tratamiento</h4>
                                <div className="border rounded overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500">Medicamento</th>
                                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500">Dosis</th>
                                                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500">Frecuencia</th>
                                                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tratamientoForm.medicamentos.map((med, index) => {
                                                const medicamento = medicamentos.find(m => m.id === med.medicamentoId);
                                                return (
                                                    <tr key={index}>
                                                        <td className="px-2 py-2 text-sm text-gray-900">{medicamento?.nombre}</td>
                                                        <td className="px-2 py-2 text-sm text-gray-900">{med.dosis} {med.unidadMedida}</td>
                                                        <td className="px-2 py-2 text-sm text-gray-900">{med.frecuencia}</td>
                                                        <td className="px-2 py-2 text-sm text-gray-900 text-right">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => eliminarMedicamento(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Observaciones */}
            <div>
                <label className="block mb-1">Observaciones:</label>
                <textarea
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>

            {/* Select de Patologías (opcional) */}
            <div>
                <label className="block mb-1">Patología (opcional):</label>
                <select
                    value={patologiaId}
                    onChange={e =>
                        setPatologiaId(e.target.value === "" ? "" : +e.target.value)
                    }
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

            {/* Mensaje de error */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Botón guardar */}
            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
                Guardar Atención
            </button>
        </form>
    );
}
