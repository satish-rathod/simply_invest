import { useState, useEffect } from 'react';
import config from '../config';

const API_URL = config.API_URL;

export const usePublicStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/public/stats`);

                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const stats = await response.json();
                setData(stats);
                setError(null);
            } catch (err) {
                console.error('Error fetching public stats:', err);
                setError(err.message);
                // Set fallback data on error
                setData({
                    activeUsers: '10,000+',
                    assetsManaged: '$50M+',
                    uptime: '99.9%',
                    support: '24/7'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { data, loading, error };
};
