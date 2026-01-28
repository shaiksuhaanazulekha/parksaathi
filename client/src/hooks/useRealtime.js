import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useRealtime = (table, callback) => {
    useEffect(() => {
        const subscription = supabase
            .channel('public:' + table)
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload) => {
                callback(payload);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [table, callback]);
};
