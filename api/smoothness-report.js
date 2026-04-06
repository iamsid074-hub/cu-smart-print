// api/smoothness-report.js
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const report = req.body;
    
    // Log performance issues to the console (vividly for monitoring)
    console.warn('--- 🤖 AI SMOOTHNESS REPORT ---');
    console.warn(`URL: ${report.url}`);
    console.warn(`User-Agent: ${report.userAgent}`);
    console.warn(`Avg FPS: ${report.metrics.avgFPS}`);
    console.warn(`Jank Events: ${report.metrics.jankEvents}`);
    console.warn(`Scroll Performance: ${report.metrics.scrollPerformance}`);
    console.warn(`Page Load Time: ${report.metrics.pageLoadTime}ms`);
    console.warn('-------------------------------');

    // In a real production app, you would save this to a database (Supabase, KV, etc.)
    // For now, logging to Vercel console is sufficient for real-time monitoring.

    return res.status(200).json({ success: true, message: 'Report received' });
}
