
import React from 'react'
import {useQuery} from '@tanstack/react-query'
import API from '../../services/api'
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from '../../components/ui/table'
import {Button} from '../../components/ui/button'
import {useToast} from '../../hooks/use-toast'

interface Cita {
    id: number
    fecha: string
    hora: string
    estado: string
    paciente: { nombre: string; apellido: string }
}

const DoctorAppointments: React.FC = () => {
    const {toast} = useToast()

    const {data, isLoading, error, refetch} = useQuery<Cita[]>({
        queryKey: ['citas-doctor'],
        queryFn: () => API.get('/citas/mis-citas-doctor').then(r => r.data),
    })

    const marcarRealizada = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/realizar`)
            refetch()
            toast({
                title: "Cita marcada como realizada",
                description: "La cita ha sido marcada como realizada exitosamente.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Hubo un error al marcar la cita como realizada.",
                variant: "destructive",
            })
        }
    }
    const cancelar = async (id: number) => {
        try {
            await API.patch(`/citas/${id}/cancelar-doctor`)
            refetch()
            toast({
                title: "Cita cancelada",
                description: "La cita ha sido cancelada exitosamente.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Hubo un error al cancelar la cita.",
                variant: "destructive",
            })
        }
    }

    if (isLoading) return <div>Cargando citas…</div>
    if (error) return <div>Error al cargar citas</div>

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-4">Citas Asignadas</h2>
            <div className="overflow-x-auto bg-white rounded shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.fecha}</TableCell>
                                <TableCell>{c.hora}</TableCell>
                                <TableCell>{c.paciente.nombre} {c.paciente.apellido}</TableCell>
                                <TableCell>{c.estado}</TableCell>
                                <TableCell>
                                    <Button variant="outline" onClick={() => marcarRealizada(c.id)}>
                                        Marcar Realizada
                                    </Button>
                                    <Button variant="destructive" onClick={() => cancelar(c.id)}>
                                        Cancelar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default DoctorAppointments
