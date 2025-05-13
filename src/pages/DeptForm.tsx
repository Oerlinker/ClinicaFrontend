import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import API from "../services/api";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import DeptEmployees from "./DeptEmployees";

interface Departamento {
    id: number;
    nombre: string;
    descripcion: string;
}

interface DeptFormProps {
    deptId?: string | null;
    onSuccess?: () => void;
}

const DeptForm: React.FC<DeptFormProps> = ({ deptId, onSuccess }) => {
    const params = useParams<{ id: string }>();
    const id = deptId || params.id;
    const isEdit = Boolean(id) && id !== "nuevo";
    const navigate = useNavigate();
    const { toast } = useToast();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    useEffect(() => {
        if (isEdit) {
            API.get<Departamento>(`/departamentos/${id}`)
                .then(res => {
                    setNombre(res.data.nombre);
                    setDescripcion(res.data.descripcion);
                })
                .catch(() => toast({ title: "Error al cargar departamento", variant: "destructive" }));
        } else {
            // Limpiar el formulario si estamos creando uno nuevo
            setNombre("");
            setDescripcion("");
        }
    }, [id, isEdit]);

    const mutation = useMutation({
        mutationFn: (payload: { nombre: string; descripcion: string }) => {
            return isEdit
                ? API.put(`/departamentos/${id}`, payload)
                : API.post("/departamentos", payload);
        },
        onSuccess: () => {
            toast({ title: isEdit ? "Departamento actualizado" : "Departamento creado" });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate("/admin/departamentos");
            }
        },
        onError: (err: any) => {
            toast({ title: err.response?.data || "Error", variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ nombre, descripcion });
    };

    return (
        <div className="p-6 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
                {isEdit ? "Editar" : "Nuevo"} Departamento
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                        id="nombre"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                        id="descripcion"
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                    />
                </div>

                {isEdit && id && (
                    <div className="mt-6">
                        <DeptEmployees deptId={id}/>
                    </div>
                )}

                <Button type="submit" className="w-full">
                    {isEdit ? "Actualizar" : "Crear"}
                </Button>
            </form>
        </div>
    );
};

export default DeptForm;
