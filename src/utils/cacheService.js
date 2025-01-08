// cacheService.js
class CacheService {
    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    generateKey(url, params) {
        const sortedParams = params ? JSON.stringify(Object.entries(params).sort()) : '';
        return `${url}:${sortedParams}`;
    }

    set(key, data, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, {
            data,
            expiresAt
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

// TTL configurations (in milliseconds)
export const CACHE_TTL = {
    SHORT: 1 * 60 * 1000,    // 1 minute
    MEDIUM: 5 * 60 * 1000,   // 5 minutes
    LONG: 15 * 60 * 1000,    // 15 minutes
    VERY_LONG: 60 * 60 * 1000 // 1 hour
};

// Create cache instances for different data types
export const metricsCache = new CacheService(CACHE_TTL.MEDIUM);
export const optionsCache = new CacheService(CACHE_TTL.SHORT);
export const strikeCache = new CacheService(CACHE_TTL.LONG);
export const expirationCache = new CacheService(CACHE_TTL.LONG);

// Custom hook for cached API calls
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCachedApiCall = (url, params = null, cacheInstance, ttl = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const cacheKey = cacheInstance.generateKey(url, params);
                const cachedData = cacheInstance.get(cacheKey);

                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }

                const response = await axios.get(url, { params });
                const responseData = response.data;

                cacheInstance.set(cacheKey, responseData, ttl);
                setData(responseData);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, JSON.stringify(params)]);

    return { data, loading, error };
};