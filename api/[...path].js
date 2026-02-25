// This file is intentionally unused — all Supabase proxy requests
// go to /api/sb instead. This file exists only to prevent stale deployments.
module.exports = function handler(req, res) {
    res.status(404).json({ error: 'use /api/sb instead' });
};
