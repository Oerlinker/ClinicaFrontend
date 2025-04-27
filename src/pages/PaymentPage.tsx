import React, {useEffect, useState} from "react";
import {loadStripe, Stripe} from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import {useNavigate} from "react-router-dom";


interface ConfigResponse {
    publicKey: string;
}


interface CreatePaymentResponse {
    clientSecret: string;
}


interface PaymentPageProps {
    citaId: number;
    pacienteId: number;
    amount: number;
    currency: string;
}


const CheckoutForm: React.FC<{ clientSecret: string }> = ({clientSecret}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);

        const card = elements.getElement(CardElement);
        if (!card) return;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {card},
        });

        if (result.error) {
            setError(result.error.message || "Error desconocido");
        } else if (result.paymentIntent?.status === "succeeded") {
            setSucceeded(true);
            setError(null);
            navigate("/");
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            <CardElement options={{hidePostalCode: true}}/>
            <button
                type="submit"
                disabled={!stripe || processing || succeeded}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
                {processing
                    ? "Procesando..."
                    : succeeded
                        ? "¡Pago exitoso!"
                        : "Pagar"}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
    );
};


const PaymentPage: React.FC<PaymentPageProps> = ({citaId, pacienteId, amount, currency}) => {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [clientSecret, setClientSecret] = useState<string>("");

    useEffect(() => {

        fetch("/api/payments/config")
            .then((res) => res.json())
            .then((config: ConfigResponse) => {
                setStripePromise(loadStripe(config.publicKey));
            });


        fetch("/api/payments/create-payment-intent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                amount,
                currency,
                citaId,
                pacienteId,
            }),
        })
            .then((res) => res.json())
            .then((data: CreatePaymentResponse) => {
                setClientSecret(data.clientSecret);
            });
    }, [citaId, pacienteId, amount, currency]);

    if (!stripePromise || !clientSecret) return <div>Cargando...</div>;

    return (
        <Elements stripe={stripePromise} options={{clientSecret}}>
            <CheckoutForm clientSecret={clientSecret}/>
        </Elements>
    );
};

export default PaymentPage;