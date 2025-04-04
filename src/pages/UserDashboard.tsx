import React from "react";
import header from "../components/Header";
import {useAuth} from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import Header from "../components/Header";
import { Calendar, Clock, Eye, FileClock, FileText, User } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard: React.FC = () => {
    const {user} = useAuth();
    if (!user) {
        return <div>No hay usuario autenticado</div>;
    }
    if (!user.rol || (user.rol.id !== 3 && user.rol.nombre !== "PACIENTE")) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header/>
                <main className="container mx-auto px-4 py-8">
                    <p className="text-red-600">No tienes permisos para acceder a este dashboard.</p>
                </main>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome
                            back, {user.nombre} {user.apellido}</h1>
                        <p className="text-gray-600">Email: {user.email}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Link to="/appointment">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Calendar className="mr-2 h-4 w-4"/>
                                Reservar Cita
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};



export default UserDashboard;