import React from 'react';
import { Link } from 'react-router-dom';

const NoPermissionPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p className="text-gray-700 mb-8">No tienes permiso para acceder a esta página.</p>
            <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Volver al Inicio
            </Link>
        </div>
    );
};

export default NoPermissionPage;
