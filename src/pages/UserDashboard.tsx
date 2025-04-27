import React from "react";
import {useAuth} from "../contexts/AuthContext";
import {Button} from "../components/ui/button";
import Header from "../components/Header";
import {Calendar} from "lucide-react";
import {Link} from "react-router-dom";
import AppointmentsPage from "./AppointmentPage";

const UserDashboard: React.FC = () => {
    const {user} = useAuth();

    if (!user) {
        return <div>No hay usuario autenticado</div>;
    }

    if (!user.rol || (user.rol.id !== 5 && user.rol.nombre !== "PACIENTE")) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">
                        Acceso Denegado
                    </h1>
                    <p className="text-gray-700 mb-8">
                        No tienes permisos para acceder a este dashboard.
                    </p>
                    <Link
                        to="/"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <div
                                className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center overflow-hidden">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-9 h-9 text-gray-500"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18.685 19.089a3.091 3.091 0 00-1.296-3.367c-.29-1.139-.97-2.215-1.896-2.888a3.343 3.343 0 00-2.041-.578H9.832a3.343 3.343 0 00-2.041.578c-.926.673-1.606 1.749-1.896 2.888a3.091 3.091 0 00-1.296 3.367m11.6-3.175a4.5 4.5 0 00-3 3.975l-.015.005H4.594l-.015-.005a4.5 4.5 0 00-3-3.975V7.5a3 3 0 013-3h15a3 3 0 013 3v8.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Información del Usuario
                                </h2>
                            </div>
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold text-gray-700">Nombre:</span>{" "}
                            <span className="text-gray-600">{user.nombre}</span>
                        </div>
                        <div className="mb-2">
                            <span className="font-semibold text-gray-700">Apellido:</span>{" "}
                            <span className="text-gray-600">{user.apellido}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Email:</span>{" "}
                            <span className="text-gray-600">{user.email}</span>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Acciones
                        </h2>
                        <Link to="/Appointment">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Calendar className="mr-2 h-4 w-4"/>
                                Reservar Cita
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Mis Citas
                    </h2>
                    <AppointmentsPage/>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
