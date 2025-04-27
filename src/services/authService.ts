import API from "./api";

export interface RegisterData {
    nombre?: string;
    apellido?: string;
    password: string;
    email: string;
}

export interface LoginData {
    email: string;
    password: string;
}


export const registerUser = async (data: RegisterData) => {
    try {
        const response = await API.post("/auth/register", data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};


export const loginUser = async (data: LoginData) => {
    try {
        const response = await API.post("/auth/login", data);
        console.log("Respuesta del backend:", response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || error.message;
    }
};
