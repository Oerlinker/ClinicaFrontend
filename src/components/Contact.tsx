import {Button} from "./ui/button";

const Contact = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Contactanos</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        ¿Tiene preguntas o quiere programar una cita?
                        Nuestro amable personal está aquí para ayudarle con todas sus necesidades de cuidado ocular.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <div
                            className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-8 h-8 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Nuestra Ubicacion</h3>
                        <p className="text-gray-600 mb-4">
                            123 Vision Street<br/>
                            Medical District<br/>
                            New York, NY 10001
                        </p>
                        <Button variant="link" className="text-blue-600">
                            Nuestra Direccion
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <div
                            className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-8 h-8 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Horarios de Atencion</h3>
                        <ul className="text-gray-600 mb-4 space-y-1">
                            <li>Monday - Friday: 8am - 6pm</li>
                            <li>Saturday: 9am - 2pm</li>
                            <li>Sunday: Closed</li>
                        </ul>
                        <Button variant="link" className="text-blue-600">
                            Request Appointment
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                        <div
                            className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-8 h-8 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Informacion de Contacto</h3>
                        <p className="text-gray-600 mb-4">
                            Phone: (555) 123-4567<br/>
                            Email: info@eyehub.com<br/>
                            Fax: (555) 123-4568
                        </p>
                        <Button variant="link" className="text-blue-600">
                            Call Now
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;