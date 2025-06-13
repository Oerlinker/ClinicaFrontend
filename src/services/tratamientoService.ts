import API from './api';

export interface Tratamiento {
  id: number;
  nombre: string;
  descripcion: string;
  duracionDias: number;
  fechaInicio: string;
  fechaFin: string;
  atencionId: number;
  observaciones?: string;
  activo: boolean;
  medicamentosTratamiento: MedicamentoTratamiento[];
}

export interface TratamientoDTO {
  nombre: string;
  descripcion: string;
  duracionDias: number;
  fechaInicio: string;
  fechaFin: string;
  atencionId: number;
  observaciones?: string;
  medicamentos?: MedicamentoTratamientoDTO[];
}

export interface MedicamentoTratamiento {
  id: number;
  medicamentoId: number;
  tratamientoId?: number;
  nombreMedicamento?: string;
  dosis: string;
  unidadMedida: string;
  frecuencia: string;
  duracionDias: number;
  viaAdministracion: string;
  instrucciones: string;
}

export interface MedicamentoTratamientoDTO {
  medicamentoId: number;
  dosis: string;
  unidadMedida: string;
  frecuencia: string;
  duracionDias: number;
  viaAdministracion: string;
  instrucciones: string;
}

const getAllTratamientos = () => {
  return API.get('/tratamientos');
};

const getTratamientosByAtencion = (atencionId: number) => {
  return API.get(`/tratamientos/atencion/${atencionId}`);
};

const getTratamientoById = (id: number) => {
  return API.get(`/tratamientos/${id}`);
};

const createTratamiento = (tratamientoDTO: TratamientoDTO) => {
  return API.post('/tratamientos', tratamientoDTO);
};

const updateTratamiento = (id: number, tratamientoDTO: TratamientoDTO) => {
  return API.put(`/tratamientos/${id}`, tratamientoDTO);
};

const deleteTratamiento = (id: number) => {
  return API.delete(`/tratamientos/${id}`);
};

// Servicios para Medicamentos en Tratamientos
const getMedicamentosByTratamiento = (tratamientoId: number) => {
  return API.get(`/tratamientos/${tratamientoId}/medicamentos`);
};

const addMedicamentoToTratamiento = (
  tratamientoId: number,
  medicamentoTratamientoDTO: MedicamentoTratamientoDTO
) => {
  return API.post(`/tratamientos/${tratamientoId}/medicamentos`, medicamentoTratamientoDTO);
};

const removeMedicamentoFromTratamiento = (
  tratamientoId: number,
  medicamentoTratamientoId: number
) => {
  return API.delete(`/tratamientos/${tratamientoId}/medicamentos/${medicamentoTratamientoId}`);
};

const tratamientoService = {
  getAllTratamientos,
  getTratamientosByAtencion,
  getTratamientoById,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento,
  getMedicamentosByTratamiento,
  addMedicamentoToTratamiento,
  removeMedicamentoFromTratamiento
};

export default tratamientoService;
