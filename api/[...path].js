export default async function handler(req, res) {
    const SUPABASE_URL = 'https://xzzjmhfsmdnpzegfzrvo.supabase.co';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info,prefer,range,accept');
        return res.status(204).end();
    }

    // Strip /api/ prefix to get the Supabase path
    const proxyPath = req.url.replace(/^\/api\/?/, '');
    const targetUrl = `${SUPABASE_URL}/${proxyPath}`;

    // Forward headers, skip hop-by-hop ones
    const headers = {};
    const skip = new Set(['host', 'connection', 'transfer-encoding', 'content-length', 'accept-encoding']);
    for (const [key, val] of Object.entries(req.headers)) {
        if (!skip.has(key.toLowerCase())) {
            headers[key] = val;
        }
    }

    const init = { method: req.method, headers };

    // Forward body for non-GET requests
    if (!['GET', 'HEAD'].includes(req.method) && req.body != null) {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    try {
        const upstream = await fetch(targetUrl, init);

        // Forward response headers
        upstream.headers.forEach((v, k) => {
            if (!['content-encoding', 'transfer-encoding', 'connection'].includes(k.toLowerCase())) {
                res.setHeader(k, v);
            }
        });

        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).send(buf);
    } catch (err) {
        console.error('Supabase proxy error:', err);
        res.status(502).json({ error: 'proxy_error', message: err.message });
    }
}
