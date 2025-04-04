
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {Link, useNavigate} from "react-router-dom";
import Header from "../components/Header";
import {registerUser,RegisterData} from "../services/authService";
import {useState} from "react";



const Register: React.FC = () => {
    const[formData,setFormData]=useState<RegisterData>({
        nombre: "",
        apellido: "",
        email: "",
        password: ""
    });
    const [error,setError] = useState<string | null>(null);
    const [loading,setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate= useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            const result = await registerUser(formData);
            console.log("Usuario registrado:",result);
            setSuccess(true);
            setError(null);
            navigate("/login");
        }catch (err){
            console.error(err);
            setError(err as string);
            setSuccess(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Crea tu Cuenta</CardTitle>
                        <CardDescription className="text-center">
                            Ingresa tus datos para crear una cuenta
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" name="nombre" placeholder="Andres" onChange={handleChange} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido</Label>
                                    <Input id="apellido" name="apellido" placeholder="Segovia" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="name@example.com" onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" onChange={handleChange} required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
                                Register
                            </Button>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link to="/login" className="text-blue-600 hover:underline">
                                    Login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;