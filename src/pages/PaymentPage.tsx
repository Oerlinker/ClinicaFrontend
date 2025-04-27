import React, {useEffect, useState} from 'react'
import {loadStripe, Stripe} from '@stripe/stripe-js'
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js'
import API from '../services/api'  // usamos API con baseURL configurada
import {useNavigate, useParams} from 'react-router-dom'

interface ConfigResp {
    publicKey: string
}

type CreateIntentResp = { clientSecret: string }

type PaymentRouteParams = {
    citaId: string;
    pacienteId: string;
    amount: string;
    currency: string;
}

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

const PaymentPage: React.FC = () => {
    const {citaId, pacienteId, amount, currency} = useParams<PaymentRouteParams>()
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
    const [clientSecret, setClientSecret] = useState<string>('')

    useEffect(() => {
        async function init() {
            try {

                const {data: {publicKey}} = await API.get<ConfigResp>('/payments/config')
                const stripe = await loadStripe(publicKey)
                setStripePromise(Promise.resolve(stripe))


                const payload = {
                    amount: Number(amount),
                    currency,
                    citaId: Number(citaId),
                    pacienteId: Number(pacienteId)
                }
                const {data} = await API.post<CreateIntentResp>('/payments/create-payment-intent', payload)
                setClientSecret(data.clientSecret)
            } catch (err) {
                console.error('Error inicializando pago:', err)
            }
        }

        init()
    }, [citaId, pacienteId, amount, currency])

    if (!stripePromise || !clientSecret) {
        return <div>Cargando método de pago…</div>
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl mb-4">Paga tu cita</h2>
            <Elements stripe={stripePromise} options={{clientSecret}}>
                <CheckoutForm clientSecret={clientSecret}/>
            </Elements>
        </div>
    )
}

export default PaymentPage;
