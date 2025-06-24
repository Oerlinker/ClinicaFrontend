import React from 'react';
import Header from '../components/Header';
import { Card, CardContent } from '../components/ui/card';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Sobre Nosotros
          </h1>

          {/* Hero Section */}
          <div className="relative rounded-lg overflow-hidden mb-12 h-80">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Clínica Horus"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h2 className="text-white text-2xl md:text-3xl font-bold">
                Clínica Horus
              </h2>
              <p className="text-white/90">
                Excelencia en cuidado visual desde 2010
              </p>
            </div>
          </div>

          {/* Mission and Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Nuestra Misión</h3>
                <p className="text-gray-600">
                  Proporcionar servicios oftalmológicos de la más alta calidad, con un enfoque centrado en el paciente y utilizando tecnologías avanzadas para mejorar la salud visual de nuestra comunidad.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Nuestra Visión</h3>
                <p className="text-gray-600">
                  Ser reconocidos como el centro oftalmológico líder en innovación, calidad de atención y satisfacción del paciente, estableciendo nuevos estándares en el cuidado de la salud visual.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historia */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
            <p className="text-gray-600 mb-4">
              Fundada en 2010, la Clínica Horus comenzó como un pequeño consultorio con la visión del Dr. Roberto Méndez de brindar atención oftalmológica especializada y accesible. A lo largo de los años, hemos crecido hasta convertirnos en un centro de referencia en salud visual.
            </p>
            <p className="text-gray-600 mb-4">
              En 2015, expandimos nuestras instalaciones e incorporamos tecnología de vanguardia para diagnósticos más precisos y tratamientos más efectivos. Desde entonces, nuestro equipo ha continuado creciendo con especialistas en diversos campos de la oftalmología.
            </p>
            <p className="text-gray-600">
              Hoy, Clínica Horus cuenta con múltiples centros de atención y un equipo de más de 20 especialistas dedicados a brindar el mejor cuidado para sus ojos. Seguimos comprometidos con la excelencia en la atención médica y la satisfacción de nuestros pacientes.
            </p>
          </div>

          {/* Valores */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuestros Valores</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Excelencia</h3>
                <p className="text-gray-600 text-sm">
                  Nos esforzamos por alcanzar los más altos estándares en atención médica y servicio al paciente.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Innovación</h3>
                <p className="text-gray-600 text-sm">
                  Adoptamos las últimas tecnologías y métodos para ofrecer diagnósticos precisos y tratamientos efectivos.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Compasión</h3>
                <p className="text-gray-600 text-sm">
                  Tratamos a cada paciente con respeto, dignidad y un genuino interés por su bienestar.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Integridad</h3>
                <p className="text-gray-600 text-sm">
                  Actuamos con transparencia y honestidad en todas nuestras interacciones.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Accesibilidad</h3>
                <p className="text-gray-600 text-sm">
                  Trabajamos para hacer que la atención oftalmológica de calidad sea accesible para todos.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Educación</h3>
                <p className="text-gray-600 text-sm">
                  Creemos en empoderar a nuestros pacientes con conocimiento sobre el cuidado de su salud visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
