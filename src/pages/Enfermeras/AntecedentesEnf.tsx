import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import API from '../../services/api';
import {Label} from '../../components/ui/label';
import {Button} from '../../components/ui/button';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '../../components/ui/table';
import {useToast} from '../../hooks/use-toast';
import {format, parseISO} from 'date-fns';

interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
}

type Antecedente = {
    id: number;
    tipo: string;
    descripcion: string;
    fechaRegistro: string;
};

const tipos = [
    {value: 'PERSONAL', label: 'Personal'},
    {value: 'FAMILIAR', label: 'Familiar'},
    {value: 'ALERGIA', label: 'Alergia'},
    {value: 'QUIRURGICO', label: 'Quirúrgico'},
];

export default function AntecedentesEnf() {
    const {toast} = useToast();
    const queryClient = useQueryClient();
    const [pacienteId, setPacienteId] = useState<string>('');
    const [tipo, setTipo] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Carga Select de Pacientes
    const {data: pacientes = [], isLoading: loadingPacientes} = useQuery({
        queryKey: ['pacientes'],
        queryFn: () => API.get<Paciente[]>('/auth/usuarios/pacientes').then(res => res.data)
    });

    // Carga Antecedentes según pacienteId
    const {data: antecedentes = [], isLoading: loadingAnte} = useQuery({
        queryKey: ['antecedentes', pacienteId],
        queryFn: () => API.get<Antecedente[]>(`/antecedentes/usuario/${pacienteId}`).then(res => res.data),
        enabled: !!pacienteId
    });

    // Mutación para crear
    const createMutation = useMutation({
        mutationFn: (newAnt: { usuarioId: number; tipo: string; descripcion: string }) =>
            API.post('/antecedentes', newAnt),
        onSuccess: () => {
            toast({title: 'Creado', description: 'Antecedente agregado.'});
            queryClient.invalidateQueries({queryKey: ['antecedentes', pacienteId]});
            resetForm();
        }
    });

    // Mutación para actualizar
    const updateMutation = useMutation({
        mutationFn: (upd: { id: number; usuarioId: number; tipo: string; descripcion: string }) =>
            API.put(`/antecedentes/${upd.id}`, {
                usuarioId: upd.usuarioId,
                tipo: upd.tipo,
                descripcion: upd.descripcion,
            }),
        onSuccess: () => {
            toast({title: 'Actualizado', description: 'Antecedente modificado.'});
            queryClient.invalidateQueries({queryKey: ['antecedentes', pacienteId]});
            resetForm();
        }
    });

    const resetForm = () => {
        setTipo('');
        setDescripcion('');
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tipo || !descripcion || !pacienteId) {
            toast({title: 'Error', description: 'Completa todos los campos.', variant: 'destructive'});
            return;
        }
        const payload = {usuarioId: Number(pacienteId), tipo, descripcion};
        if (editingId != null) {
            updateMutation.mutate({...payload, id: editingId});
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (ant: Antecedente) => {
        setEditingId(ant.id);
        setTipo(ant.tipo);
        setDescripcion(ant.descripcion);
    };

    if (loadingPacientes) return <p>Cargando pacientes...</p>;


    return (
        <div>
            <div className="mb-4">
                <Label htmlFor="paciente-select">Seleccione Paciente</Label>
                <select
                    id="paciente-select"
                    className="w-full border rounded p-2"
                    value={pacienteId}
                    onChange={e => setPacienteId(e.target.value)}
                >
                    <option value="">-- Paciente --</option>
                    {pacientes.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellido}
                        </option>
                    ))}
                </select>
            </div>

            {/* Formulario para crear/editar antecedentes */}
            {pacienteId && (
                <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-white shadow">
                    <h3 className="text-lg font-medium mb-2">
                        {editingId ? 'Editar antecedente' : 'Nuevo antecedente'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="tipo-select">Tipo</Label>
                            <select
                                id="tipo-select"
                                className="w-full border rounded p-2"
                                value={tipo}
                                onChange={e => setTipo(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccione tipo --</option>
                                {tipos.map(t => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <input
                                id="descripcion"
                                type="text"
                                className="w-full border rounded p-2"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button type="submit">
                            {editingId ? 'Actualizar' : 'Agregar'}
                        </Button>
                        {editingId && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            )}

            {pacienteId && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha Registro</TableHead>
                                <TableHead>Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingAnte ? (
                                <TableRow>
                                    <TableCell colSpan={4}>Cargando antecedentes...</TableCell>
                                </TableRow>
                            ) : antecedentes.length ? (
                                antecedentes.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell>{a.tipo}</TableCell>
                                        <TableCell>{a.descripcion}</TableCell>
                                        <TableCell>{format(parseISO(a.fechaRegistro), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(a)}
                                            >
                                                Editar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>No hay antecedentes registrados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
