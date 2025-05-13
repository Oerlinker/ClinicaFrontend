import React, {useState} from "react";
import {Button} from "../components/ui/button";
import DeptList from "./DeptList";
import DeptForm from "./DeptForm";

const AdminDepartamentosDashboard: React.FC = () => {
    const [view, setView] = useState<"list" | "register">("list");
    const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

    const handleRegistrationSuccess = () => {
        setView("list");
        setEditingDeptId(null);
    };

    const handleEditDept = (id: string) => {
        setEditingDeptId(id);
        setView("register");
    };

    const handleNewDept = () => {
        setEditingDeptId(null);
        setView("register");
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-4 flex space-x-4">
                <Button
                    variant={view === "list" ? "default" : "outline"}
                    onClick={() => setView("list")}
                >
                    Listado de Departamentos
                </Button>
                <Button
                    variant={view === "register" ? "default" : "outline"}
                    onClick={handleNewDept}
                >
                    Registrar Departamento
                </Button>
            </div>

            {view === "list" ? (
                <DeptList onEditDept={handleEditDept}/>
            ) : (
                <DeptForm
                    deptId={editingDeptId}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
};

export default AdminDepartamentosDashboard;
