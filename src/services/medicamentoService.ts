import API from './api';

export interface Medicamento {
  id: number;
  nombre: string;
  descripcion: string;
  fabricante: string;
  efectosSecundarios: string;
  activo: boolean;
}

export interface MedicamentoDTO {
  nombre: string;
  descripcion: string;
  fabricante: string;
  efectosSecundarios: string;
}

const getAllMedicamentos = () => {
  return API.get('/medicamentos');
};

const getMedicamentoById = (id: number) => {
  return API.get(`/medicamentos/${id}`);
};

const buscarMedicamentosPorNombre = (nombre: string) => {
  return API.get(`/medicamentos/buscar?nombre=${nombre}`);
};

const createMedicamento = (medicamentoDTO: MedicamentoDTO) => {
  return API.post('/medicamentos', medicamentoDTO);
};

const updateMedicamento = (id: number, medicamentoDTO: MedicamentoDTO) => {
  return API.put(`/medicamentos/${id}`, medicamentoDTO);
};

const deleteMedicamento = (id: number) => {
  return API.delete(`/medicamentos/${id}`);
};

const medicamentoService = {
  getAllMedicamentos,
  getMedicamentoById,
  buscarMedicamentosPorNombre,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
};

export default medicamentoService;
