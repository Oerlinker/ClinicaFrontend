import React, {useEffect, useState} from 'react'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

interface Props {
    citaId: number
    pacienteId: number
    amount: number
    currency: string
}


type ConfigResp = { publicKey: string }
type CreateIntentReq = {
    amount: number
    currency: string
    citaId: number
    pacienteId: number
}
type CreateIntentResp = { clientSecret: string }

const CheckoutForm: React.FC<{ clientSecret: string }> = ({clientSecret}) => {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setProcessing(true)
        setError(null)

        const card = elements.getElement(CardElement)
        if (!card) {
            setError('No se encontró el elemento de tarjeta')
            setProcessing(false)
            return
        }

        const {error: stripeError, paymentIntent} =
            await stripe.confirmCardPayment(clientSecret, {payment_method: {card}})

        if (stripeError) {
            setError(stripeError.message!)
            setProcessing(false)
        } else if (paymentIntent?.status === 'succeeded') {
            navigate('/pago-exitoso')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardElement options={{hidePostalCode: true}}/>
            <button
                type="submit"
                disabled={!stripe || processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-md"
            >
                {processing ? 'Procesando...' : 'Pagar'}
            </button>
            {error && <p className="text-red-600">{error}</p>}
        </form>
    )
}

const PaymentPage: React.FC<Props> = ({citaId, pacienteId, amount, currency}) => {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>(Promise.resolve(null))
    const [clientSecret, setClientSecret] = useState<string>('')

    useEffect(() => {

        axios.get<ConfigResp>('/api/payments/config')
            .then(res => setStripePromise(loadStripe(res.data.publicKey)))
            .catch(console.error)


        const payload: CreateIntentReq = {amount, currency, citaId, pacienteId}
        axios.post<CreateIntentResp>('/api/payments/create-payment-intent', payload)
            .then(res => setClientSecret(res.data.clientSecret))
            .catch(err => console.error('Error creando intent:', err))
    }, [citaId, pacienteId, amount, currency])

    if (!clientSecret) return <div>Cargando método de pago…</div>

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl mb-4">Paga tu cita</h2>
            <Elements stripe={stripePromise} options={{clientSecret}}>
                <CheckoutForm clientSecret={clientSecret}/>
            </Elements>
        </div>
    )
}

export default PaymentPage
