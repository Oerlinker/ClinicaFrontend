import {Button} from "./ui/button";
import {Link} from "react-router-dom";

const About = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                        <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            alt="Medical team"
                            className="rounded-lg shadow-lg"
                        />
                    </div>

                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Sobre la Clinica Horus</h2>
                        <div className="w-20 h-1 bg-blue-600 mb-6"></div>

                        <p className="text-gray-600 mb-4">

                            Fundada en 2005, EyeHub Clinic lleva más de 15 años a la vanguardia de la atención
                            oftalmológica. Nuestra misión es brindar servicios excepcionales de cuidado ocular con
                            compasión, experiencia y la tecnología más avanzada.

                        </p>

                        <p className="text-gray-600 mb-6">

                            Nuestro equipo de oftalmólogos certificados y personal capacitado se comprometen con la
                            excelencia en cada aspecto de su atención. Nos enorgullece crear planes de tratamiento
                            personalizados que abordan sus necesidades visuales únicas.
                        </p>

                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M5 13l4 4L19 7"></path>
                                </svg>
                                Especialistas certificados en todos los aspectos de la atención oftalmológica
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M5 13l4 4L19 7"></path>
                                </svg>
                                Servicios de atención al paciente de alta calidad y centrados en el cliente
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M5 13l4 4L19 7"></path>
                                </svg>
                                Tratamientos personalizados y tecnología de vanguardia
                            </li>
                        </ul>

                        <Link to="/about">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                               Aprende mas sobre nosotros
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;