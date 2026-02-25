const https = require('https');

module.exports = async (req, res) => {
    // Debug endpoint: visit /api/sb in browser to verify function works
    if (req.method === 'GET' && !req.query.url) {
        return res.status(200).json({
            status: 'proxy_ok',
            node: process.version,
            time: new Date().toISOString(),
        });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        return res.status(204).end();
    }

    const raw = req.query.url;
    if (!raw || typeof raw !== 'string' || !raw.includes('supabase.co')) {
        return res.status(400).json({ error: 'missing_or_invalid_url', received: typeof raw });
    }

    try {
        let parsedUrl;
        try {
            parsedUrl = new URL(raw);
        } catch (e) {
            return res.status(400).json({ error: 'url_parse_failed', raw: raw.substring(0, 100), detail: e.message });
        }

        // Prepare body
        let bodyStr = null;
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body != null) {
            bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Build headers to forward
        const fwdHeaders = {};
        const skipSet = ['host', 'connection', 'transfer-encoding', 'accept-encoding'];
        for (const [k, v] of Object.entries(req.headers)) {
            if (!skipSet.includes(k.toLowerCase())) {
                fwdHeaders[k] = v;
            }
        }
        fwdHeaders['host'] = parsedUrl.hostname;
        if (bodyStr) {
            fwdHeaders['content-length'] = String(Buffer.byteLength(bodyStr));
        } else {
            delete fwdHeaders['content-length'];
        }

        return new Promise((resolve) => {
            const options = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: req.method,
                headers: fwdHeaders,
            };

            const proxyReq = https.request(options, (proxyRes) => {
                // Collect response body as chunks
                const chunks = [];
                proxyRes.on('data', (chunk) => chunks.push(chunk));
                proxyRes.on('end', () => {
                    try {
                        const body = Buffer.concat(chunks);
                        // Forward content-type
                        const ct = proxyRes.headers['content-type'];
                        if (ct) res.setHeader('Content-Type', ct);
                        res.status(proxyRes.statusCode).send(body);
                    } catch (e) {
                        if (!res.headersSent) res.status(500).json({ error: 'response_error', detail: e.message });
                    }
                    resolve();
                });
            });

            proxyReq.on('error', (err) => {
                if (!res.headersSent) {
                    res.status(502).json({ error: 'upstream_error', message: err.message });
                }
                resolve();
            });

            proxyReq.setTimeout(9000, () => {
                proxyReq.destroy();
                if (!res.headersSent) {
                    res.status(504).json({ error: 'timeout' });
                }
                resolve();
            });

            if (bodyStr) proxyReq.write(bodyStr);
            proxyReq.end();
        });
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'caught_error', message: err.message, stack: err.stack });
        }
    }
};
