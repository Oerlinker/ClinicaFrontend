import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../services/api";
import { Button } from "../components/ui/button";

interface Empleado {
    id: number;
    nombre: string;
    apellido: string;
}

interface Props {
    deptId: string;
}

const DeptEmployees: React.FC<Props> = ({ deptId }) => {
    const qc = useQueryClient();

    const { data: asignados = [] } = useQuery<Empleado[]>({
        queryKey: ["empleados-departamento", deptId],
        queryFn: () => API.get(`/empleados/departamento/${deptId}`).then(r => r.data),
    });

    const { data: disponibles = [] } = useQuery<Empleado[]>({
        queryKey: ["empleados-sin-departamento"],
        queryFn: () => API.get("/empleados/sin-departamento").then(r => r.data),
    });

    const asignar = useMutation({
        mutationFn: (empId: number) =>
            API.patch(`/empleados/${empId}/departamento/${deptId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["empleados-departamento", deptId] });
            qc.invalidateQueries({ queryKey: ["empleados-sin-departamento"] });
        },
    });

    const quitar = useMutation({
        mutationFn: (empId: number) =>
            API.patch(`/empleados/${empId}/sin-departamento`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["empleados-departamento", deptId] });
            qc.invalidateQueries({ queryKey: ["empleados-sin-departamento"] });
        },
    });

    return (
        <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
                <h3 className="font-semibold mb-2">Asignados</h3>
                {asignados.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center mb-1">
                        <span>{emp.nombre} {emp.apellido}</span>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => quitar.mutate(emp.id)}
                        >
                            Quitar
                        </Button>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-semibold mb-2">Disponibles</h3>
                {disponibles.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center mb-1">
                        <span>{emp.nombre} {emp.apellido}</span>
                        <Button
                            size="sm"
                            onClick={() => asignar.mutate(emp.id)}
                        >
                            Asignar
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeptEmployees;
