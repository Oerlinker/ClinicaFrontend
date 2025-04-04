import {Button} from "../components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {Link, useNavigate} from "react-router-dom";
import Header from "../components/Header";
import {LoginData, loginUser} from "../services/authService";
import React, {useState} from "react";
import {useAuth} from "../contexts/AuthContext";

const Login: React.FC = () => {
    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: ""
    });
    const [error, setError] = useState<string | null>(null);
    const { user,setUser} = useAuth();
    const navigate= useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const result = await loginUser(formData);
            console.log("Usuario logeado:", result);
            localStorage.setItem("token", result.token);
            if(result.user){
                localStorage.setItem("user", JSON.stringify(result.user));
                setUser(result.user);
            }else {
                localStorage.removeItem("user");
                setUser(null);
            }
            setError(null);
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err as string);
            setUser(null);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700">Login</Button>
                    {error && <div className="text-red-600 mt-2">{error}</div>}
                    {user && <div className="text-green-600 mt-2">Login exitoso: {user.username}</div>}
                    <div className="mt-2 text-center text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;