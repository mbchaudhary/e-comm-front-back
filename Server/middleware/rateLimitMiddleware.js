const rateLimit = require('rate-limiter-flexible');
const { RateLimiterMemory } = rateLimit;

// Configure rate limiter with better defaults
const limiter = new RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // Number of requests
    duration: parseInt(process.env.RATE_LIMIT_WINDOW) || 10, // Time window in seconds
    blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION) || 5 // Block duration in seconds
});

// Helper function to get client IP
const getClientIP = (req) => {
    // Check for forwarded headers first (for proxy/load balancer scenarios)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // Get the first IP in the list (client IP)
        return forwardedFor.split(',')[0].trim();
    }
    
    // Check for real IP header
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }
    
    // Fallback to connection properties
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
};

const rateLimitMiddleware = async (req, res, next) => {
    try {
        const clientIP = getClientIP(req);
        
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV === 'development' && (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost')) {
            return next();
        }
        
        const result = await limiter.consume(clientIP);
        
        // Set rate limit headers
        res.set('X-RateLimit-Limit', limiter.points);
        res.set('X-RateLimit-Remaining', result.remainingPoints);
        res.set('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext));
        
        next();
    } catch (error) {
        if (error.remainingPoints === 0) {
            const retryAfter = Math.round(error.msBeforeNext / 1000);
            res.set('Retry-After', retryAfter);
            res.set('X-RateLimit-Limit', limiter.points);
            res.set('X-RateLimit-Remaining', error.remainingPoints);
            res.set('X-RateLimit-Reset', new Date(Date.now() + error.msBeforeNext));
            
            return res.status(429).json({
                error: 'Too many requests, please try again later.',
                retryAfter: retryAfter,
                limit: limiter.points,
                remaining: error.remainingPoints,
                resetTime: new Date(Date.now() + error.msBeforeNext).toISOString()
            });
        }
        
        // If it's not a rate limit error, pass it to the next error handler
        next(error);
    }
};

module.exports = rateLimitMiddleware;
