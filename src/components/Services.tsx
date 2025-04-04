import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";

const services = [
    {
        title: "Exámenes oculares completos",
        description: "Evaluación completa de su salud ocular y visión con equipo de diagnóstico avanzado.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        )
    },
    {
        title: "Cirugia de Cataratas",
        description: "Procedimientos quirúrgicos de última generación para eliminar cataratas y restaurar una visión clara.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                <line x1="16" y1="8" x2="2" y2="22"></line>
                <line x1="17.5" y1="15" x2="9" y2="15"></line>
            </svg>
        )
    },
    {
        title: "LASIK y cirugía refractiva",
        description: "Procedimientos láser avanzados para corregir la visión y reducir la dependencia de gafas.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A19.7 19.7 0 0 1 12 21.95"></path>
                <path d="M8 14.42a7.5 7.5 0 0 1-5.32-2.974A19.7 19.7 0 0 0 12 3.05"></path>
                <path d="m2 2 20 20"></path>
            </svg>
        )
    },
    {
        title: "Tratamiento de Glaucoma",
        description: "Atención y manejo especializado de pacientes con glaucoma para preservar la visión.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"></path>
                <path d="M7 10h5"></path>
                <path d="M7 14h3"></path>
                <circle cx="16" cy="10" r="1"></circle>
                <circle cx="16" cy="14" r="1"></circle>
            </svg>
        )
    },
];

const Services = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Servicios</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">

                        Ofrecemos una amplia gama de servicios oftalmológicos utilizando la última tecnología y
                        tratamientos para garantizar el mejor cuidado para sus ojos.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="text-blue-600 mb-4">{service.icon}</div>
                                <CardTitle>{service.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-gray-600">{service.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
