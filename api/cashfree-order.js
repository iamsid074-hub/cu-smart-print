import https from 'node:https';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, customer_id, customer_phone, customer_name, customer_email, order_note } = req.body;

    if (!amount || !customer_id || !customer_phone) {
        return res.status(400).json({ error: 'Missing required fields: amount, customer_id, customer_phone' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'sandbox';

    if (!appId || !secretKey) {
        return res.status(500).json({ error: 'Cashfree credentials not configured' });
    }

    const host = env === 'production' ? 'api.cashfree.com' : 'sandbox.cashfree.com';
    const orderId = `CUB_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const body = JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: 'INR',
        customer_details: {
            customer_id: String(customer_id).slice(0, 50),
            customer_phone: String(customer_phone).replace(/\D/g, '').slice(0, 10),
            customer_name: customer_name || 'CUBazaar Customer',
            customer_email: customer_email || undefined,
        },
        order_meta: {
            return_url: `https://cubazzar.shop/payment-status?order_id=${orderId}`,
        },
        order_note: order_note || 'CU Bazaar Order',
    });

    return new Promise((resolve) => {
        const request = https.request(
            {
                hostname: host,
                path: '/pg/orders',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-version': '2025-01-01',
                    'x-client-id': appId,
                    'x-client-secret': secretKey,
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (upstream) => {
                const chunks = [];
                upstream.on('data', (c) => chunks.push(c));
                upstream.on('end', () => {
                    const raw = Buffer.concat(chunks).toString();
                    try {
                        const data = JSON.parse(raw);
                        if (upstream.statusCode >= 400) {
                            res.status(upstream.statusCode).json({ error: data.message || 'Cashfree error', details: data });
                        } else {
                            res.status(200).json({
                                payment_session_id: data.payment_session_id,
                                cf_order_id: data.cf_order_id,
                                order_id: data.order_id,
                            });
                        }
                    } catch {
                        res.status(502).json({ error: 'Invalid response from Cashfree', raw });
                    }
                    resolve();
                });
            }
        );

        request.on('error', (e) => {
            if (!res.headersSent) res.status(502).json({ error: e.message });
            resolve();
        });

        request.setTimeout(15000, () => {
            request.destroy();
            if (!res.headersSent) res.status(504).json({ error: 'Cashfree API timeout' });
            resolve();
        });

        request.write(body);
        request.end();
    });
}
