import {Button} from "./ui/button";
import {Link} from "react-router-dom";

const Hero = () => {
    return (
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Tu Vision, <span className="text-blue-600">Nuestra Prioridad</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">

                        Soluciones avanzadas para el cuidado de la vista con un enfoque personalizado. Nuestros
                        especialistas experimentados se dedican a preservar y mejorar su visión con tecnología de
                        vanguardia..
                    </p>
                    <div className="flex space-x-4">
                        <Link to="/appointment">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2">
                                Reservar Cita
                            </Button>
                        </Link>
                        <Link to="/services">
                            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                Nuestros Servicios
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="md:w-1/2">
                    <div className="relative rounded-lg overflow-hidden shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1580121441575-41bcb5c6b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            alt="Eye examination"
                            className="w-full h-auto rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
