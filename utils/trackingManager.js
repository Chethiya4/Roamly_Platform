/**
 * Real-time In-Memory Tracking Manager
 * Maintains active online visitor sessions with automatic pruning for stale sessions (> 3 minutes).
 */

class TrackingManager {
    constructor() {
        // Map<sessionId, SessionObject>
        this.sessions = new Map();
        // Session timeout: 3 minutes (180,000 ms)
        this.timeoutMs = 3 * 60 * 1000;
        
        // Prune stale sessions every 30 seconds
        setInterval(() => this.pruneStaleSessions(), 30000);
    }

    /**
     * Record or refresh a session heartbeat
     */
    recordHeartbeat(data) {
        const {
            sessionId,
            userId = null,
            userName = 'Guest Visitor',
            role = 'guest',
            currentPage = '/',
            ip = '127.0.0.1',
            userAgent = 'Browser'
        } = data;

        if (!sessionId) return null;

        const now = new Date();
        const existing = this.sessions.get(sessionId);

        const sessionData = {
            sessionId,
            userId,
            userName: userId ? userName : 'Guest Visitor',
            role: role || 'guest',
            currentPage: currentPage || '/',
            ip,
            userAgent,
            startedAt: existing ? existing.startedAt : now,
            lastSeen: now
        };

        this.sessions.set(sessionId, sessionData);
        return sessionData;
    }

    /**
     * Remove sessions inactive for longer than timeoutMs
     */
    pruneStaleSessions() {
        const now = Date.now();
        for (const [id, session] of this.sessions.entries()) {
            if (now - new Date(session.lastSeen).getTime() > this.timeoutMs) {
                this.sessions.delete(id);
            }
        }
    }

    /**
     * Get live statistics of active sessions
     */
    getLiveStats() {
        this.pruneStaleSessions();
        const activeSessions = Array.from(this.sessions.values());

        const breakdown = {
            visitor: 0,
            business_owner: 0,
            admin: 0,
            guest: 0
        };

        const pageViews = {};

        activeSessions.forEach(s => {
            const r = s.role || 'guest';
            if (breakdown[r] !== undefined) {
                breakdown[r]++;
            } else {
                breakdown.guest++;
            }

            const page = s.currentPage || '/';
            pageViews[page] = (pageViews[page] || 0) + 1;
        });

        // Convert pageViews object to sorted array
        const topPages = Object.entries(pageViews)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count);

        return {
            totalOnline: activeSessions.length,
            breakdown,
            topPages,
            activeSessions: activeSessions.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        };
    }
}

const trackingManager = new TrackingManager();
module.exports = trackingManager;
