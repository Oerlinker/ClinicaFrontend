import React from 'react'
import { Link } from 'react-router-dom'

const PaymentSuccessPage: React.FC = () => (
    <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">¡Pago realizado!</h1>
        <p className="mb-6">Tu cita ya ha sido marcada como pagada.</p>
        <Link
            to="/dashboard"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded"
        >
            Volver a mis citas
        </Link>
    </div>
)

export default PaymentSuccessPage
