
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Rol {
    id: number;
    nombre: string;
}
interface Usuario {
    token: string;
    id: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: Rol;
}


interface AuthContextType {
    user: Usuario | null;
    setUser: (user: Usuario | null) => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


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


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
