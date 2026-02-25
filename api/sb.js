import https from 'node:https';
import { URL } from 'node:url';

// Disable Vercel's automatic body parsing so we can forward raw binary (file uploads) untouched
export const config = {
    api: {
        bodyParser: false,
    },
};

// Collect raw body from the incoming request stream
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    // Debug endpoint
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
    if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.includes('supabase')) {
        return res.status(400).json({ error: 'bad_url', received: String(targetUrl).slice(0, 60) });
    }

    try {
        const parsed = new URL(targetUrl);

        // Read raw body for non-GET requests (handles JSON, binary, multipart — everything)
        let rawBody = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            rawBody = await getRawBody(req);
            if (rawBody.length === 0) rawBody = null;
        }

        // Forward headers — keep content-type intact so Supabase knows what it's receiving
        const h = {};
        const skip = ['host', 'connection', 'transfer-encoding', 'accept-encoding'];
        for (const [k, v] of Object.entries(req.headers)) {
            if (!skip.includes(k)) h[k] = v;
        }
        h['host'] = parsed.hostname;
        if (rawBody) {
            h['content-length'] = String(rawBody.length);
        } else {
            delete h['content-length'];
        }

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

            r.setTimeout(15000, () => {
                r.destroy();
                if (!res.headersSent) res.status(504).json({ error: 'timeout' });
                resolve();
            });

            if (rawBody) r.write(rawBody);
            r.end();
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
