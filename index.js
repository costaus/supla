// index.js - Codigo da sua Funcao Serverless

const express = require('express');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Suas credenciais do Firebase
// Voce precisara de uma conta de servico do Firebase para isso
const firebaseConfig = {
    projectId: 'pfcon-a79aa',
};

// Inicializa o Firebase Admin SDK
initializeApp(firebaseConfig);
const db = getFirestore();

// Suas credenciais de TESTE do Mercado Pago
mercadopago.configure({
    access_token: "TEST-28b2d15b-6a1f-4dc5-9e94-9e758cb9674c"
});

const app = express();
app.use(bodyParser.json());

app.post('/process-payment', async (req, res) => {
    const { paymentMethod, userId } = req.body;
    console.log(`Recebido pedido de pagamento para o usuario ${userId} via ${paymentMethod}`);

    try {
        let paymentData;

        // Logica para criar uma preferencia de pagamento no Mercado Pago
        // Nota: A integracao real pode variar.
        const preference = {
            items: [
                {
                    title: "Taxa de Inscrição Concurso PF",
                    quantity: 1,
                    unit_price: 49.90,
                }
            ],
            payer: {
                // Aqui voce pode incluir dados do usuario
            },
        };

        const result = await mercadopago.preferences.create(preference);
        
        // Em um cenário real, você processaria o pagamento aqui.
        // Como é um exemplo, vamos apenas simular um sucesso.
        const paymentId = 'simulated-payment-id-' + Date.now();
        const paymentStatus = 'approved';

        if (paymentStatus === 'approved' || paymentStatus === 'pending') {
            const userDocRef = db.doc(`artifacts/default-app-id/users/${userId}/registration/status`);
            await userDocRef.set({
                paid: true,
                timestamp: FieldValue.serverTimestamp(),
                paymentId: paymentId,
                paymentMethod: paymentMethod
            });
            res.status(200).json({ success: true, message: "Pagamento processado com sucesso!" });
        } else {
            res.status(400).json({ success: false, message: "Erro ao processar o pagamento." });
        }

    } catch (error) {
        console.error("Erro na API do Mercado Pago ou Firebase:", error);
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
});

// Exporta a função para o Google Cloud Functions
exports.processPayment = app;
