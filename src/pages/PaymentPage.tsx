import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/api'

type PaymentRouteParams = {
    citaId: string
    pacienteId: string
    amount: string
    currency: string
}

const PaymentPage: React.FC = () => {
    const { citaId, pacienteId, amount, currency } = useParams<PaymentRouteParams>()

    useEffect(() => {
        const initCheckout = async () => {
            try {

                const payload = {
                    amount: Number(amount),
                    currency,
                    citaId: Number(citaId),
                    pacienteId: Number(pacienteId),
                }

                const { data } = await API.post<{ url: string }>('/payments/create-checkout-session', payload)
                window.location.href = data.url
            } catch (err) {
                console.error('Error iniciando Stripe Checkout:', err)

            }
        }

        initCheckout()
    }, [citaId, pacienteId, amount, currency])

    return (
        <div className="max-w-md mx-auto p-6 text-center">
            <p className="text-lg">Redirigiendo al método de pago…</p>
        </div>
    )
}

export default PaymentPage
