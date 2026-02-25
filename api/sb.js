module.exports = async function handler(req, res) {
    // Security: only allow proxying to our supabase project
    const SUPABASE_HOST = 'xzzjmhfsmdnpzegfzrvo.supabase.co';
    const targetUrl = decodeURIComponent(req.query.url || '');

    if (!targetUrl || !targetUrl.includes(SUPABASE_HOST)) {
        return res.status(403).json({ error: 'forbidden', detail: 'invalid target url' });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info,prefer,range,accept');
        return res.status(204).end();
    }

    // Build headers to forward (skip hop-by-hop headers)
    const headers = {};
    const skip = new Set(['host', 'connection', 'transfer-encoding', 'content-length', 'accept-encoding']);
    for (const [key, val] of Object.entries(req.headers)) {
        if (!skip.has(key.toLowerCase())) {
            headers[key] = val;
        }
    }

    const init = { method: req.method, headers };

    // Forward body for write operations
    if (!['GET', 'HEAD'].includes(req.method) && req.body !== undefined && req.body !== null) {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        if (!headers['content-type']) headers['content-type'] = 'application/json';
    }

    try {
        const upstream = await fetch(targetUrl, init);

        upstream.headers.forEach((v, k) => {
            const lk = k.toLowerCase();
            if (!['content-encoding', 'transfer-encoding', 'connection'].includes(lk)) {
                res.setHeader(k, v);
            }
        });

        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).send(buf);
    } catch (err) {
        console.error('[sb proxy] error:', err.message, 'target:', targetUrl);
        res.status(502).json({ error: 'proxy_error', message: err.message });
    }
};
