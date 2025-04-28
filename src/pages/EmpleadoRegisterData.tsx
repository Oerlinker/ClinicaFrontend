import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import API from "../services/api";
import {Button} from "../components/ui/button";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";


interface Especialidad {
    id: number;
    nombre: string;
}

interface Cargo {
    id: number;
    nombre: string;
}

interface EmpleadoRegisterData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    cargoId: string;
    especialidadId: string;
    fechaContratacion?: string;
    salario?: string;
}

const EmpleadoRegister: React.FC = () => {
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

    const {data: cargos, isLoading, error} = useQuery<Cargo[]>({
        queryKey: ["cargos"],
        queryFn: async () => {
            const response = await API.get("/cargos");
            return response.data;
        },
    });


    const {
        data: especialidades,
        isLoading: loadingEsp,
        error: errorEsp
    } = useQuery<Especialidad[]>({
        queryKey: ["especialidades"],
        queryFn: async () => {
            const res = await API.get("/especialidades");
            return res.data;
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        try {
            const response = await API.post("/empleados", {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                password: formData.password,
                cargoId: Number(formData.cargoId),
                especialidadId: Number(formData.especialidadId),
                fechaContratacion: formData.fechaContratacion,
                salario: formData.salario,
            });
            console.log("Empleado registrado:", response.data);
        } catch (err: any) {
            console.error("Error al registrar empleado:", err.response?.data || err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded">
                <h2 className="text-xl font-bold mb-4">Registrar Empleado</h2>
                {/* ... campos de nombre, apellido, email, password, cargo ... */}
                <div className="mb-4">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="Nombre" onChange={handleChange} required/>
                </div>
                <div className="mb-4">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" placeholder="Apellido" onChange={handleChange} required/>
                </div>
                <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" onChange={handleChange} required/>
                </div>
                <div className="mb-4">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" onChange={handleChange} required/>
                </div>
                <div className="mb-4">
                    <Label htmlFor="cargoId">Cargo</Label>
                    {isLoading ? (
                        <p>Cargando cargos...</p>
                    ) : error ? (
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

                {/* ← NUEVO: selector de especialidades */}
                <div className="mb-4">
                    <Label htmlFor="especialidadId">Especialidad</Label>
                    {loadingEsp ? (
                        <p>Cargando especialidades…</p>
                    ) : errorEsp ? (
                        <p>Error cargando especialidades</p>
                    ) : (
                        <select
                            id="especialidadId"
                            value={formData.especialidadId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Selecciona una especialidad
                            </option>
                            {especialidades!.map((e) => (
                                <option key={e.id} value={e.id.toString()}>
                                    {e.nombre}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="mb-4">
                    <Label htmlFor="fechaContratacion">Fecha de Contratación (YYYY-MM-DD)</Label>
                    <Input id="fechaContratacion" type="date" onChange={handleChange}/>
                </div>
                <div className="mb-4">
                    <Label htmlFor="salario">Salario</Label>
                    <Input id="salario" type="number" step="0.01" placeholder="0.00" onChange={handleChange}/>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Registrar Empleado
                </Button>
            </form>
        </div>
    );
};

export default EmpleadoRegister;
