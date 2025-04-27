import React from 'react'
import {useQuery} from '@tanstack/react-query'
import API from '../services/api'
import {useAuth} from '../contexts/AuthContext'
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from '../components/ui/table'
import {Button} from '../components/ui/button'
import {format} from 'date-fns'
import {Link} from 'react-router-dom'

interface Cita {
    id: number
    fecha: string
    hora: string
    estado: string
    tipo: string
    doctor: {
        usuario: { nombre: string; apellido: string }
    };
    precio: number
}

const AppointmentsPage: React.FC = () => {
    const {user} = useAuth()

    const {data, isLoading, error} = useQuery<Cita[]>({
        queryKey: ['citas', user?.id],
        queryFn: () => API.get(`/citas/usuario/${user!.id}`).then(r => r.data),
        enabled: !!user
    })

    if (isLoading) return <div>Cargando citas…</div>
    if (error) return <div>Error cargando citas</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Mis Citas</h1>
                    <Link to="/Appointment">
                        <Button variant="default">+ Nueva Cita</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto bg-white rounded shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Doctor</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data!.map(cita => (
                                <TableRow key={cita.id}>
                                    <TableCell>{format(new Date(cita.fecha), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{cita.hora}</TableCell>
                                    <TableCell>
                                        Dr. {cita.doctor.usuario.nombre} {cita.doctor.usuario.apellido}
                                    </TableCell>
                                    <TableCell>{cita.tipo}</TableCell>
                                    <TableCell>{cita.estado}</TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}

export default AppointmentsPage
