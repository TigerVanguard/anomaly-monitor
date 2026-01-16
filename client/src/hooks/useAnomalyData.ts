
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface Alert {
    id: string;
    time: string;
    timestamp: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    market_question: string;
    market_slug: string;
    value: number;
    price: number;
    size: number;
}

export function useAnomalyData() {
    const { data, error, isLoading } = useSWR<Alert[]>('/data/alerts.json', fetcher, {
        refreshInterval: 5000, // Poll every 5 seconds
        fallbackData: [],
    });

    return {
        alerts: data || [],
        isLoading,
        isError: error,
    };
}
