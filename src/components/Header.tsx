import {Button} from "./ui/button";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";

const Header = () => {
    const {user, setUser} = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };
    return (
        <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-6 w-6"
                        >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        EyeHub Clinic
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>

                    {/* Mostrar estos enlaces solo si el usuario no es ADMIN */}
                    {(!user || (user && user.rol?.nombre !== "ADMIN")) && (
                        <>
                            <Link to="/services"
                                  className="text-gray-700 hover:text-blue-600 transition-colors">Servicios</Link>
                            <Link to="/doctors" className="text-gray-700 hover:text-blue-600 transition-colors">Nuestros
                                Doctores</Link>
                            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Sobre
                                Nosotros</Link>
                            <Link to="/contact"
                                  className="text-gray-700 hover:text-blue-600 transition-colors">Contacto</Link>
                        </>
                    )}

                    {/* Mostrar el enlace de dashboard para ADMIN */}
                    {user && user.rol?.nombre === "ADMIN" && (
                        <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Dashboard Admin
                        </Link>
                    )}
                    {user && (user.rol?.id === 3 || user.rol?.nombre === "PACIENTE") && (
                        <Link to="/dashboard"
                              className="text-gray-700 hover:text-blue-600 transition-colors">Perfil</Link>
                    )}
                </nav>
                <div className="flex items-center space-x-3">
                    {user ? (
                        <>
                            <span className="text-gray-700">{user.username}</span>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline"
                                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;