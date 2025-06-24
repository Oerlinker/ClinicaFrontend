import React from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const DoctorsPage: React.FC = () => {
  // Datos de ejemplo de médicos
  const doctors = [
    {
      id: 1,
      name: 'Dr. Carlos Méndez',
      specialty: 'Oftalmología General',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      description: 'Especialista con más de 15 años de experiencia en diagnóstico y tratamiento de enfermedades oculares.'
    },
    {
      id: 2,
      name: 'Dra. Laura Sánchez',
      specialty: 'Retina y Vítreo',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      description: 'Especializada en el tratamiento de enfermedades de la retina, incluida la retinopatía diabética y degeneración macular.'
    },
    {
      id: 3,
      name: 'Dr. Miguel Torres',
      specialty: 'Cirugía Refractiva',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      description: 'Experto en procedimientos de corrección visual como LASIK y cirugías para cataratas con tecnología de vanguardia.'
    },
    {
      id: 4,
      name: 'Dra. Ana Martínez',
      specialty: 'Oftalmología Pediátrica',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400&q=80',
      description: 'Dedicada al cuidado visual de niños y adolescentes, con enfoque en el diagnóstico temprano de problemas visuales.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
          Nuestros Doctores
        </h1>

        <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
          Contamos con un equipo de especialistas altamente calificados y con amplia experiencia
          en diversas áreas de la oftalmología para brindarle la mejor atención.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {doctors.map(doctor => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-60 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-gray-800">{doctor.name}</h3>
                <h4 className="text-blue-600 font-medium mb-2">{doctor.specialty}</h4>
                <p className="text-gray-600 text-sm">{doctor.description}</p>
                <Button variant="outline" className="mt-4 w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Ver perfil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-6 md:p-10 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¿Buscas atención especializada?
          </h2>
          <p className="text-gray-600 mb-6">
            Agenda una cita con uno de nuestros especialistas y recibe la atención que mereces.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2">
            Reservar Cita
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
