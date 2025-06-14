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
    const [observaciones, setObservaciones] = useState("");
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [patologiaId, setPatologiaId] = useState<number | "">("");
    const [error, setError] = useState<string | null>(null);

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

        // Carga de medicamentos
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold">Registrar Atención</h3>

            {/* Motivo */}
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

            {/* Toggle para tratamiento estructurado */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="showTratamientoForm"
                    checked={showTratamientoForm}
                    onCheckedChange={c => setShowTratamientoForm(c === true)}
                />
                <label htmlFor="showTratamientoForm" className="select-none">
                    Crear tratamiento estructurado
                </label>
            </div>

            {/* Subformulario de Tratamiento */}
            {showTratamientoForm && (
                <div className="border rounded p-4 space-y-4">
                    <h4 className="font-semibold">Detalles del Tratamiento</h4>

                    {/* Nombre y Descripción */}
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
                        />
                    </div>

                    {/* Duración y Fechas */}
                    <div className="grid grid-cols-3 gap-4">
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
                        />
                    </div>

                    {/* Medicamentos dentro del Tratamiento */}
                    <div className="space-y-3">
                        <h5 className="font-medium">Agregar Medicamento</h5>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Selección de Medicamento */}
                            <div>
                                <label className="block mb-1">Medicamento:</label>
                                <select
                                    name="medicamentoId"
                                    value={nuevoMedicamento.medicamentoId}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value={0}>-- Seleccionar --</option>
                                    {medicamentos.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.nombre} ({m.fabricante})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dosis y Unidad */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block mb-1">Dosis:</label>
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
                                    <label className="block mb-1">Unidad:</label>
                                    <select
                                        name="unidadMedida"
                                        value={nuevoMedicamento.unidadMedida}
                                        onChange={handleNuevoMedicamentoChange}
                                        className="w-full border rounded p-2"
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
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1">Frecuencia:</label>
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
                                <label className="block mb-1">Duración (días):</label>
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
                                <label className="block mb-1">Vía:</label>
                                <select
                                    name="viaAdministracion"
                                    value={nuevoMedicamento.viaAdministracion}
                                    onChange={handleNuevoMedicamentoChange}
                                    className="w-full border rounded p-2"
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
                            <label className="block mb-1">Instrucciones:</label>
                            <input
                                name="instrucciones"
                                type="text"
                                value={nuevoMedicamento.instrucciones}
                                onChange={handleNuevoMedicamentoChange}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        {/* Botón Agregar */}
                        <Button type="button" onClick={agregarMedicamento} className="w-full">
                            Agregar al tratamiento
                        </Button>
                    </div>

                    {/* Lista de Medicamentos Agregados */}
                    {tratamientoForm.medicamentos.length > 0 && (
                        <div className="mt-4">
                            <h5 className="font-medium mb-2">Medicamentos en este tratamiento</h5>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-1 text-left">Medicamento</th>
                                    <th className="px-2 py-1 text-left">Dosis</th>
                                    <th className="px-2 py-1 text-left">Frecuencia</th>
                                    <th className="px-2 py-1 text-right">Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tratamientoForm.medicamentos.map((med, i) => {
                                    const m = medicamentos.find(x => x.id === med.medicamentoId);
                                    return (
                                        <tr key={i}>
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
                    )}
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

            {/* Patología */}
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

            {error && <p className="text-red-600">{error}</p>}

            <Button type="submit" className="w-full">
                Guardar Atención
            </Button>
        </form>
    );
}
