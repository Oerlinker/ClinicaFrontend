import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import API from '../services/api';
import tratamientoService, { Tratamiento } from '../services/tratamientoService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

interface ListaTratamientosProps {
  userId: number;
}

const ListaTratamientos: React.FC<ListaTratamientosProps> = ({ userId }) => {
  const { toast } = useToast();
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarTratamientosDelPaciente = async () => {
      setIsLoading(true);
      try {
        // Primero obtenemos las atenciones del paciente
        const responseAtenciones = await API.get(`/atenciones/usuario/${userId}`);
        const atenciones = responseAtenciones.data;

        // Para cada atención, obtenemos los tratamientos asociados
        const todosTratamientos: Tratamiento[] = [];

        for (const atencion of atenciones) {
          try {
            const responseTratamientos = await tratamientoService.getTratamientosByAtencion(atencion.id);
            const tratamientosDeAtencion = responseTratamientos.data;
            todosTratamientos.push(...tratamientosDeAtencion);
          } catch (error) {
            console.error(`Error al cargar tratamientos para atención ${atencion.id}`, error);
          }
        }

        // Ordenamos los tratamientos por fecha de inicio (más recientes primero)
        todosTratamientos.sort((a, b) =>
          new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        );

        setTratamientos(todosTratamientos);
      } catch (error) {
        console.error('Error al cargar atenciones del paciente', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar sus tratamientos',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarTratamientosDelPaciente();
  }, [userId, toast]);

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-10">Cargando sus tratamientos...</div>;
  }

  if (tratamientos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No tiene tratamientos registrados
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {tratamientos.map((tratamiento) => (
          <AccordionItem
            key={tratamiento.id}
            value={`tratamiento-${tratamiento.id}`}
            className="border rounded-lg mb-4 overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
              <div className="flex justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {tratamiento.descripcion.length > 50
                      ? `${tratamiento.descripcion.substring(0, 50)}...`
                      : tratamiento.descripcion}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {formatFecha(tratamiento.fechaInicio)} - {formatFecha(tratamiento.fechaFin)}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Descripción</h4>
                  <p className="text-gray-700">{tratamiento.descripcion}</p>
                </div>

                <div>
                  <h4 className="font-medium">Periodo</h4>
                  <p className="text-gray-700">
                    Desde {formatFecha(tratamiento.fechaInicio)} hasta {formatFecha(tratamiento.fechaFin)}
                  </p>
                </div>

                {tratamiento.observaciones && (
                  <div>
                    <h4 className="font-medium">Observaciones</h4>
                    <p className="text-gray-700">{tratamiento.observaciones}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Medicamentos</h4>
                  {tratamiento.medicamentosTratamiento &&
                   tratamiento.medicamentosTratamiento.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dosis</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vía</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tratamiento.medicamentosTratamiento.map((med) => (
                            <tr key={med.id}>
                              <td className="px-4 py-2">{med.nombreMedicamento}</td>
                              <td className="px-4 py-2">{med.dosis} {med.unidadMedida}</td>
                              <td className="px-4 py-2">{med.frecuencia}</td>
                              <td className="px-4 py-2">{med.duracionDias} días</td>
                              <td className="px-4 py-2">{med.viaAdministracion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay medicamentos asignados a este tratamiento</p>
                  )}
                </div>

                {tratamiento.medicamentosTratamiento &&
                 tratamiento.medicamentosTratamiento.some(med => med.instrucciones) && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Instrucciones específicas</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {tratamiento.medicamentosTratamiento
                        .filter(med => med.instrucciones)
                        .map((med) => (
                          <li key={`inst-${med.id}`} className="text-gray-700">
                            <strong>{med.nombreMedicamento}:</strong> {med.instrucciones}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ListaTratamientos;
