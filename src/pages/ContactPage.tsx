import React, { useState } from 'react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  // Número de WhatsApp de la clínica (sin el + y con código de país)
  const whatsappNumber = '59165890361';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear el mensaje para WhatsApp
    const mensaje = `*Consulta desde la web*%0A%0A*Nombre:* ${formData.nombre}%0A*Email:* ${formData.email}%0A*Teléfono:* ${formData.telefono}%0A%0A*Mensaje:*%0A${formData.mensaje}`;

    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensaje}`;

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Redirigiendo a WhatsApp",
      description: "Te estamos conectando para enviar tu mensaje por WhatsApp.",
    });
  };

  const handleWhatsAppDirectClick = () => {
    // Enlace directo para chat de WhatsApp sin mensaje predefinido
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
            Contáctanos
          </h1>

          <p className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Estamos aquí para responder tus preguntas y ayudarte a agendar tu cita.
            Comunícate con nosotros a través de cualquiera de estos medios.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de Contacto */}
            <div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Dirección</h3>
                      <p className="text-gray-600">
                        Av. Alemana 5to anillo<br />
                        Clinica Horus<br />
                        Santa Cruz, Bolivia
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Teléfonos</h3>
                      <p className="text-gray-600 mb-2">
                        +591 65890361(WhatsApp)<br />
                      </p>
                      <button
                        onClick={handleWhatsAppDirectClick}
                        className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chatear por WhatsApp
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">
                        contacto@clinicahorus.com<br />
                        citas@clinicahorus.com
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Horario</h3>
                      <p className="text-gray-600">
                        Lunes a Viernes: 9:00 - 19:00<br />
                        Sábados: 9:00 - 14:00
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                    Envíanos un mensaje por WhatsApp
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo</Label>
                        <Input
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+591 65890361"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje</Label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        placeholder="¿En qué podemos ayudarte?"
                        rows={5}
                        className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-200"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Enviar por WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
