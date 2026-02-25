const https = require('https');
const { URL } = require('url');

module.exports = (req, res) => {
    const raw = req.query.url;
    if (!raw || !raw.includes('supabase.co')) {
        return res.status(403).json({ error: 'forbidden' });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-client-info,prefer,range,accept');
        return res.status(204).end();
    }

    let targetUrl;
    try {
        targetUrl = new URL(raw);
    } catch (e) {
        return res.status(400).json({ error: 'bad_url', detail: e.message });
    }

    // Build forwarded headers
    const fwdHeaders = {};
    const skip = ['host', 'connection', 'transfer-encoding', 'content-length', 'accept-encoding'];
    for (const [k, v] of Object.entries(req.headers)) {
        if (!skip.includes(k.toLowerCase())) fwdHeaders[k] = v;
    }
    fwdHeaders['host'] = targetUrl.hostname;

    // Prepare body for non-GET
    let bodyStr = null;
    if (!['GET', 'HEAD'].includes(req.method) && req.body != null) {
        bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        fwdHeaders['content-length'] = Buffer.byteLength(bodyStr).toString();
        if (!fwdHeaders['content-type']) fwdHeaders['content-type'] = 'application/json';
    }

    const options = {
        hostname: targetUrl.hostname,
        port: 443,
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: fwdHeaders,
    };

    const proxy = https.request(options, (upstream) => {
        // Forward status + headers
        const respHeaders = { ...upstream.headers };
        delete respHeaders['content-encoding'];
        delete respHeaders['transfer-encoding'];
        delete respHeaders['connection'];

        res.writeHead(upstream.statusCode, respHeaders);
        upstream.pipe(res);
    });

    proxy.on('error', (err) => {
        console.error('[sb proxy] error:', err.message);
        if (!res.headersSent) {
            res.status(502).json({ error: 'proxy_error', message: err.message });
        }
    });

    if (bodyStr) proxy.write(bodyStr);
    proxy.end();
};
