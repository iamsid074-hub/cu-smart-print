module.exports = async function handler(req, res) {
    const SUPABASE_URL = 'https://xzzjmhfsmdnpzegfzrvo.supabase.co';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info,prefer,range,accept');
        return res.status(204).end();
    }

    // In Vercel [...]path.js, req.query.path is the array of path segments after /api/
    const pathArray = req.query.path || [];
    const pathStr = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;

    // Extract query string from req.url (everything after the ?)
    const rawUrl = req.url || '';
    const qIndex = rawUrl.indexOf('?');
    const queryString = qIndex !== -1 ? rawUrl.slice(qIndex) : '';

    const targetUrl = `${SUPABASE_URL}/${pathStr}${queryString}`;

    // Forward safe headers only
    const headers = {};
    const skip = new Set(['host', 'connection', 'transfer-encoding', 'content-length', 'accept-encoding']);
    for (const [key, val] of Object.entries(req.headers)) {
        if (!skip.has(key.toLowerCase())) {
            headers[key] = val;
        }
    }

    const init = { method: req.method, headers };

    // Forward body for writes
    if (!['GET', 'HEAD'].includes(req.method)) {
        if (req.body !== undefined && req.body !== null) {
            init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            if (!headers['content-type']) {
                headers['content-type'] = 'application/json';
            }
        }
    }

    try {
        const upstream = await fetch(targetUrl, init);

        // Forward response headers
        upstream.headers.forEach((v, k) => {
            const lk = k.toLowerCase();
            if (!['content-encoding', 'transfer-encoding', 'connection'].includes(lk)) {
                res.setHeader(k, v);
            }
        });

        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).send(buf);
    } catch (err) {
        console.error('Supabase proxy error:', err.message, 'URL:', targetUrl);
        res.status(502).json({ error: 'proxy_error', message: err.message, url: targetUrl });
    }
};
