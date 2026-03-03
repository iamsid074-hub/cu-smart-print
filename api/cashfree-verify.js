import https from 'node:https';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const orderId = req.query.order_id;
    if (!orderId) {
        return res.status(400).json({ error: 'Missing order_id query parameter' });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'sandbox';

    if (!appId || !secretKey) {
        return res.status(500).json({ error: 'Cashfree credentials not configured' });
    }

    const host = env === 'production' ? 'api.cashfree.com' : 'sandbox.cashfree.com';

    return new Promise((resolve) => {
        const request = https.request(
            {
                hostname: host,
                path: `/pg/orders/${encodeURIComponent(orderId)}`,
                method: 'GET',
                headers: {
                    'x-api-version': '2025-01-01',
                    'x-client-id': appId,
                    'x-client-secret': secretKey,
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
                                verified: data.order_status === 'PAID',
                                order_status: data.order_status,
                                order_id: data.order_id,
                                cf_order_id: data.cf_order_id,
                                order_amount: data.order_amount,
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

        request.end();
    });
}
