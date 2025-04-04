// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Rol {
    id: number;
    nombre: string;
}
interface Usuario {
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: Rol;
}

// Definimos la interfaz de nuestro contexto
interface AuthContextType {
    user: Usuario | null;
    setUser: (user: Usuario | null) => void;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Usuario | null>(() => {
        const storedUser = localStorage.getItem("user");
        if(!storedUser||storedUser==="undefined"){
            return null;
        }
        return JSON.parse(storedUser);
    });

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};