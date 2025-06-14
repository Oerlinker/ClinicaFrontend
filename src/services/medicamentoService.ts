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

const createMedicamento = async (medicamentoDTO: MedicamentoDTO) => {
  try {
    // Verificamos el token antes de enviar
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user") || '{}').token;
    console.log("Token disponible:", !!token);

    // Logs para depuración
    console.log("Enviando datos de medicamento:", medicamentoDTO);

    // Realizamos la solicitud con manejo explícito de errores
    const response = await API.post('/medicamentos', medicamentoDTO);
    console.log("Respuesta del servidor:", response);
    return response;
  } catch (error: any) {
    console.error("Error en createMedicamento:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
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
