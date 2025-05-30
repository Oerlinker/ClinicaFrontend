import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import API from "../services/api";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {useToast} from "../hooks/use-toast";

interface Cargo {
    id: number;
    nombre: string;
}

interface Especialidad {
    id: number;
    nombre: string;
}

interface EmpleadoRegisterData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    cargoId: string;
    especialidadId?: string;
    fechaContratacion?: string;
    salario?: string;
}

interface EmpleadoRegisterProps {
    onSuccess: () => void;
}

const EmpleadoRegister: React.FC<EmpleadoRegisterProps> = ({onSuccess}) => {
    const [formData, setFormData] = useState<EmpleadoRegisterData>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        cargoId: "",
        especialidadId: "",
        fechaContratacion: "",
        salario: "",
    });

    const {toast} = useToast();

    const {
        data: cargos,
        isLoading: loadingCargos,
        error: errorCargos,
    } = useQuery<Cargo[]>({
        queryKey: ["cargos"],
        queryFn: async () => {
            const res = await API.get("/cargos");
            return res.data;
        },
    });

    const {
        data: especialidades,
        isLoading: loadingEsp,
        error: errorEsp,
    } = useQuery<Especialidad[]>({
        queryKey: ["especialidades"],
        queryFn: async () => {
            const res = await API.get("/especialidades");
            return res.data;
        },
    });

    const selectedCargo = cargos?.find(
        (c) => c.id.toString() === formData.cargoId
    );
    const mostrarEspecialidad =
        selectedCargo?.nombre.toLowerCase() === "médico";

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.cargoId) {
            console.error("No se ha seleccionado un cargo");
            return;
        }
        if (mostrarEspecialidad && !formData.especialidadId) {
            console.error("El cargo Médico requiere una especialidad");
            return;
        }

        try {
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                password: formData.password,
                cargoId: Number(formData.cargoId),
                especialidadId: mostrarEspecialidad
                    ? Number(formData.especialidadId)
                    : null,
                fechaContratacion: formData.fechaContratacion,
                salario: formData.salario,
            };
            const response = await API.post("/empleados", payload);
            console.log("Empleado registrado:", response.data);
            toast({
                title: "Empleado registrado exitosamente!",
                description: "El empleado ha sido registrado correctamente.",
            });
            onSuccess();
        } catch (err: any) {
            console.error(
                "Error al registrar empleado:",
                err.response?.data || err.message
            );
            toast({
                title: "Error al registrar empleado",
                description:
                    err.response?.data?.message ||
                    err.message ||
                    "Ocurrió un error al registrar el empleado.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto p-4 bg-white shadow rounded"
            >
                <h2 className="text-xl font-bold mb-4">Registrar Empleado</h2>

                <div className="mb-4">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                        id="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                        id="apellido"
                        placeholder="Apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="cargoId">Cargo</Label>
                    {loadingCargos ? (
                        <p>Cargando cargos...</p>
                    ) : errorCargos ? (
                        <p>Error al cargar cargos</p>
                    ) : (
                        <select
                            id="cargoId"
                            value={formData.cargoId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Seleccione un cargo
                            </option>
                            {cargos?.map((cargo) => (
                                <option key={cargo.id} value={cargo.id.toString()}>
                                    {cargo.nombre}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {mostrarEspecialidad && (
                    <div className="mb-4">
                        <Label htmlFor="especialidadId">Especialidad</Label>
                        {loadingEsp ? (
                            <p>Cargando especialidades...</p>
                        ) : errorEsp ? (
                            <p>Error al cargar especialidades</p>
                        ) : (
                            <select
                                id="especialidadId"
                                value={formData.especialidadId}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Seleccione una especialidad
                                </option>
                                {especialidades?.map((e) => (
                                    <option key={e.id} value={e.id.toString()}>
                                        {e.nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                <div className="mb-4">
                    <Label htmlFor="fechaContratacion">
                        Fecha de Contratación (YYYY-MM-DD)
                    </Label>
                    <Input
                        id="fechaContratacion"
                        type="date"
                        value={formData.fechaContratacion}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="salario">Salario</Label>
                    <Input
                        id="salario"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.salario}
                        onChange={handleChange}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    Registrar Empleado
                </Button>
            </form>
        </div>
    );
};

export default EmpleadoRegister;
