import React from 'react';
import Header from '../components/Header';
import Services from '../components/Services';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Nuestros Servicios
          </h1>

          <p className="text-lg text-gray-600 mb-8 text-center">
            En Clínica Horus nos especializamos en ofrecer servicios oftalmológicos
            de alta calidad utilizando tecnología avanzada y un equipo de especialistas
            altamente cualificados.
          </p>

          {/* Utilizando el componente Services existente */}
          <Services />

          <div className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2">
                Agenda una cita ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
