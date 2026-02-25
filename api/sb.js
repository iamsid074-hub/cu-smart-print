import https from 'node:https';
import { URL } from 'node:url';

export default async function handler(req, res) {
    // Debug endpoint: GET /api/sb → verify function works
    if (req.method === 'GET' && !req.query.url) {
        return res.status(200).json({ status: 'alive', v: process.version });
    }

    // CORS
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        return res.status(204).end();
    }

    const targetUrl = req.query.url;
    if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.includes('supabase.co')) {
        return res.status(400).json({ error: 'bad_url' });
    }

    try {
        const parsed = new URL(targetUrl);

        // Body
        let body = null;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body != null) {
            body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Forward headers
        const h = {};
        const skip = ['host', 'connection', 'transfer-encoding', 'accept-encoding'];
        for (const [k, v] of Object.entries(req.headers)) {
            if (!skip.includes(k)) h[k] = v;
        }
        h['host'] = parsed.hostname;
        if (body) h['content-length'] = String(Buffer.byteLength(body));
        else delete h['content-length'];

        return new Promise((resolve) => {
            const r = https.request({
                hostname: parsed.hostname,
                port: 443,
                path: parsed.pathname + parsed.search,
                method: req.method,
                headers: h,
            }, (upstream) => {
                const chunks = [];
                upstream.on('data', (c) => chunks.push(c));
                upstream.on('end', () => {
                    const buf = Buffer.concat(chunks);
                    const ct = upstream.headers['content-type'];
                    if (ct) res.setHeader('Content-Type', ct);
                    res.status(upstream.statusCode).send(buf);
                    resolve();
                });
            });

            r.on('error', (e) => {
                if (!res.headersSent) res.status(502).json({ error: e.message });
                resolve();
            });

            r.setTimeout(9000, () => {
                r.destroy();
                if (!res.headersSent) res.status(504).json({ error: 'timeout' });
                resolve();
            });

            if (body) r.write(body);
            r.end();
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
