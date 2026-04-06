// smoothness-ai.js
class WebsiteSmoothnessAI {
    constructor(config = {}) {
        this.config = {
            fpsThreshold: config.fpsThreshold || 50,
            jankThreshold: config.jankThreshold || 16.67, // ms (60fps = 16.67ms per frame)
            autoFix: config.autoFix !== false,
            reportingEndpoint: config.reportingEndpoint || '/api/smoothness-report',
            debugMode: config.debugMode || false
        };
        
        this.metrics = {
            fps: [],
            jankEvents: [],
            scrollPerformance: [],
            buttonResponsiveness: [],
            transitionPerformance: [],
            pageLoadTimes: []
        };
        
        this.init();
    }

    init() {
        this.monitorFPS();
        this.monitorScrollPerformance();
        this.monitorButtonResponsiveness();
        this.monitorTransitions();
        this.monitorPageLoad();
        this.applyOptimizations();
        this.setupPerformanceObserver();
        
        if (this.config.debugMode) {
            this.createDebugPanel();
        }
    }

    // FPS Monitoring
    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const checkFrame = (currentTime) => {
            frames++;
            const delta = currentTime - lastTime;
            
            if (delta >= 1000) {
                const fps = Math.round((frames * 1000) / delta);
                this.metrics.fps.push({ time: Date.now(), fps });
                
                if (fps < this.config.fpsThreshold) {
                    this.handleLowFPS(fps);
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkFrame);
        };
        
        requestAnimationFrame(checkFrame);
    }

    // Scroll Performance
    monitorScrollPerformance() {
        let scrollStartTime;
        let isScrolling;
        
        window.addEventListener('scroll', () => {
            if (!scrollStartTime) {
                scrollStartTime = performance.now();
            }
            
            clearTimeout(isScrolling);
            
            isScrolling = setTimeout(() => {
                const scrollDuration = performance.now() - scrollStartTime;
                this.metrics.scrollPerformance.push({
                    time: Date.now(),
                    duration: scrollDuration
                });
                
                if (scrollDuration > 100) {
                    this.optimizeScrolling();
                }
                
                scrollStartTime = null;
            }, 150);
        }, { passive: true });
    }

    // Button Responsiveness
    monitorButtonResponsiveness() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, a, [role="button"]');
            if (!button) return;
            
            const startTime = performance.now();
            
            requestAnimationFrame(() => {
                const responseTime = performance.now() - startTime;
                
                this.metrics.buttonResponsiveness.push({
                    element: button.tagName,
                    time: Date.now(),
                    responseTime
                });
                
                if (responseTime > 100) {
                    this.optimizeButton(button);
                }
            });
        }, true);
    }

    // Transition Monitoring
    monitorTransitions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                    this.checkTransitionPerformance(mutation.target);
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'style']
        });
    }

    checkTransitionPerformance(element) {
        const styles = window.getComputedStyle(element);
        const transition = styles.transition;
        
        if (transition && transition !== 'all 0s ease 0s') {
            const startTime = performance.now();
            
            const checkComplete = () => {
                const duration = performance.now() - startTime;
                
                this.metrics.transitionPerformance.push({
                    element: element.tagName,
                    time: Date.now(),
                    duration
                });
                
                if (duration > 500) {
                    this.optimizeTransition(element);
                }
            };
            
            element.addEventListener('transitionend', checkComplete, { once: true });
        }
    }

    // Page Load Monitoring
    monitorPageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            if (perfData) {
                this.metrics.pageLoadTimes.push({
                    time: Date.now(),
                    loadTime: perfData.loadEventEnd - perfData.fetchStart,
                    domInteractive: perfData.domInteractive - perfData.fetchStart,
                    domComplete: perfData.domComplete - perfData.fetchStart
                });
            }
        });
    }

    // Performance Observer
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > this.config.jankThreshold) {
                        this.metrics.jankEvents.push({
                            time: Date.now(),
                            duration: entry.duration,
                            name: entry.name
                        });
                        
                        if (this.config.autoFix) {
                            this.handleJank(entry);
                        }
                    }
                }
            });
            
            // Try to observe long tasks if possible
            try {
                observer.observe({ entryTypes: ['measure', 'longtask'] });
            } catch (e) {
                // Ignore if longtask is not supported
            }
        }
    }

    // Auto-fix Functions
    handleLowFPS(fps) {
        console.warn(`Low FPS detected: ${fps}`);
        
        // Reduce animation quality
        document.documentElement.style.setProperty('--animation-quality', 'reduced');
        
        // Disable non-critical animations
        const style = document.createElement('style');
        style.innerHTML = `
            .ai-performance-mode * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        style.id = 'ai-performance-boost';
        
        if (!document.getElementById('ai-performance-boost')) {
            document.head.appendChild(style);
            document.body.classList.add('ai-performance-mode');
        }
    }

    optimizeScrolling() {
        // Apply will-change to scrollable elements
        const scrollables = document.querySelectorAll('[data-scroll], .scrollable, .overflow-auto, .overflow-scroll');
        
        scrollables.forEach(el => {
            if (el instanceof HTMLElement && !el.style.willChange) {
                el.style.willChange = 'transform';
                el.style.transform = 'translateZ(0)'; // Force GPU acceleration
            }
        });
    }

    optimizeButton(button) {
        if (!button.dataset.optimized) {
            button.style.willChange = 'transform, opacity';
            button.style.transform = 'translateZ(0)';
            button.dataset.optimized = 'true';
            
            // Debounce click events
            let timeout;
            button.addEventListener('click', (e) => {
                if (timeout) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                timeout = setTimeout(() => {
                    timeout = null;
                }, 300);
            }, true);
        }
    }

    optimizeTransition(element) {
        const styles = window.getComputedStyle(element);
        const properties = styles.transitionProperty.split(',');
        
        // Only allow GPU-accelerated properties
        const optimizedProps = properties.filter(prop => 
            ['transform', 'opacity'].includes(prop.trim())
        );
        
        if (optimizedProps.length !== properties.length) {
            element.style.transitionProperty = optimizedProps.join(', ');
            element.style.willChange = optimizedProps.join(', ');
        }
    }

    handleJank(entry) {
        console.warn('Jank detected:', entry);
        
        // Implement strategies based on jank source
        if (entry.name.includes('style') || entry.name.includes('layout')) {
            this.reduceReflows();
        }
    }

    reduceReflows() {
        // Batch DOM reads and writes
        const style = document.createElement('style');
        style.innerHTML = `
            .ai-optimized {
                contain: layout style paint;
            }
        `;
        
        if (!document.getElementById('ai-reflow-optimization')) {
            style.id = 'ai-reflow-optimization';
            document.head.appendChild(style);
        }
        
        // Add contain property to large elements
        const largeElements = Array.from(document.querySelectorAll('section, article, .container'));
        largeElements.forEach(el => {
            if (el instanceof HTMLElement && el.offsetHeight > 500) {
                el.classList.add('ai-optimized');
            }
        });
    }

    // Apply Global Optimizations
    applyOptimizations() {
        const style = document.createElement('style');
        style.id = 'ai-global-optimizations';
        style.innerHTML = `
            /* AI-Applied Performance Optimizations */
            * {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            img, video {
                will-change: transform;
                transform: translateZ(0);
            }
            
            /* Smooth scrolling with performance */
            html {
                scroll-behavior: smooth;
            }
            
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
            
            /* Optimize animations */
            @keyframes ai-smooth-fade {
                from { opacity: 0; transform: translateZ(0); }
                to { opacity: 1; transform: translateZ(0); }
            }
            
            .ai-fade-in {
                animation: ai-smooth-fade 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: opacity, transform;
            }
            
            /* Button optimization */
            button, a, [role="button"] {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            
            /* Scroll optimization */
            .scroll-container {
                -webkit-overflow-scrolling: touch;
                overflow-scrolling: touch;
            }
        `;
        
        if (!document.getElementById('ai-global-optimizations')) {
            document.head.appendChild(style);
        }
        
        // Add intersection observer for lazy animations
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('ai-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe sections and major elements
        document.querySelectorAll('section, .card, .animate').forEach(el => {
            observer.observe(el);
        });
    }

    // Debug Panel
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-debug-panel';
        panel.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: #0f0;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 999999;
                min-width: 250px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            ">
                <div style="font-weight: bold; margin-bottom: 10px; color: #fff;">
                    🤖 AI Smoothness Monitor
                </div>
                <div id="ai-fps">FPS: --</div>
                <div id="ai-jank">Jank Events: 0</div>
                <div id="ai-scroll">Scroll Performance: Good</div>
                <div id="ai-status" style="margin-top: 10px; color: #0f0;">● Active</div>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 10px;
                    background: #f00;
                    color: #fff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Update debug info
        setInterval(() => {
            const avgFPS = this.getAverageFPS();
            const jankCount = this.metrics.jankEvents.length;
            
            const fpsEl = document.getElementById('ai-fps');
            if (fpsEl) fpsEl.textContent = `FPS: ${avgFPS}`;

            const jankEl = document.getElementById('ai-jank');
            if (jankEl) jankEl.textContent = `Jank Events: ${jankCount}`;
            
            const scrollPerf = this.getScrollPerformance();
            const scrollEl = document.getElementById('ai-scroll');
            if (scrollEl) scrollEl.textContent = `Scroll: ${scrollPerf}`;
        }, 1000);
    }

    // Analytics
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return '--';
        const recent = this.metrics.fps.slice(-10);
        const avg = recent.reduce((sum, m) => sum + m.fps, 0) / recent.length;
        return Math.round(avg);
    }

    getScrollPerformance() {
        if (this.metrics.scrollPerformance.length === 0) return 'Good';
        const recent = this.metrics.scrollPerformance.slice(-5);
        const avg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
        
        if (avg < 50) return 'Excellent';
        if (avg < 100) return 'Good';
        if (avg < 200) return 'Fair';
        return 'Poor';
    }

    // Send Reports
    sendReport() {
        const report = {
            timestamp: Date.now(),
            metrics: {
                avgFPS: this.getAverageFPS(),
                jankEvents: this.metrics.jankEvents.length,
                scrollPerformance: this.getScrollPerformance(),
                pageLoadTime: this.metrics.pageLoadTimes[0]?.loadTime || 0
            },
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        if (this.config.reportingEndpoint) {
            fetch(this.config.reportingEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            }).catch(err => console.error('Report failed:', err));
        }
        
        return report;
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    reset() {
        this.metrics = {
            fps: [],
            jankEvents: [],
            scrollPerformance: [],
            buttonResponsiveness: [],
            transitionPerformance: [],
            pageLoadTimes: []
        };
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.SmoothnessAI = WebsiteSmoothnessAI;
}

export default WebsiteSmoothnessAI;
