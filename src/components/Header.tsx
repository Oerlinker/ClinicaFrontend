import {Button} from "./ui/button";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {useIsMobile} from "../hooks/use-mobile";
import {useState} from "react";
import {Menu, X} from "lucide-react";

const Header = () => {
    const {user, setUser} = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    const renderNavLinks = () => (
        <>
            <Link to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={closeMobileMenu}>
                Home
            </Link>


            {(!user || (user && user.rol?.nombre !== "ADMIN")) && (
                <>
                    <Link to="/services"
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}>
                        Servicios
                    </Link>
                    <Link to="/doctors"
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}>
                        Nuestros Doctores
                    </Link>
                    <Link to="/about"
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}>
                        Sobre Nosotros
                    </Link>
                    <Link to="/contact"
                          className="text-gray-700 hover:text-blue-600 transition-colors"
                          onClick={closeMobileMenu}>
                        Contacto
                    </Link>
                </>
            )}
            {user && user.rol?.nombre === "EMPLEADO" && user.cargo?.id === 3 && (
                             <Link
                               to="/secretaria-dashboard"
                               className="text-gray-700 hover:text-blue-600 transition-colors"
                               onClick={closeMobileMenu}
                            >
                               Dashboard Secretaria
                              </Link>
                        )}

            {user && user.rol?.nombre === "DOCTOR" && (
                <Link to="/doctor-dashboard"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}>
                    Dashboard Doctor
                </Link>
            )}

            {user && user.rol?.nombre === "ADMIN" && (
                <Link to="/admin-dashboard"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}>
                    Dashboard Admin
                </Link>
            )}
            {user && (user.rol?.id === 3 || user.rol?.nombre === "PACIENTE") && (
                <Link to="/dashboard"
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={closeMobileMenu}>
                    Perfil
                </Link>
            )}
        </>
    );

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
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Clinica Horus
                    </Link>
                </div>


                <nav className="hidden md:flex items-center space-x-6">
                    {renderNavLinks()}
                </nav>


                <div className="hidden md:flex items-center space-x-3">
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


                {isMobile && (
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 text-blue-600"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                )}
            </div>


            {isMobile && mobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-lg">
                    <div className="px-4 py-3 space-y-3">

                        <div className="flex flex-col space-y-3">
                            {renderNavLinks()}
                        </div>


                        <div className="pt-3 border-t border-gray-200">
                            {user ? (
                                <div className="flex flex-col space-y-2">
                                    <span className="text-gray-700">{user.username}</span>
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2">
                                    <Link to="/login" onClick={closeMobileMenu}>
                                        <Button variant="outline"
                                                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={closeMobileMenu}>
                                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
