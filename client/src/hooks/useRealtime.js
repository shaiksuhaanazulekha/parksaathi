import { useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { auth } from '../services/firebase';

export const useRealtime = (table, callback) => {
    useEffect(() => {
        if (!auth.app) return;
        const db = getFirestore(auth.app);
        
        let colName = table;
        if (table === 'bookings') colName = 'Bookings';
        if (table === 'parking_spots') colName = 'ParkingSpaces';
        if (table === 'payments') colName = 'Payments';
        if (table === 'profiles') colName = 'Users';
        if (table === 'notifications') colName = 'Notifications';

        const q = query(collection(db, colName));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                data.id = change.doc.id;
                // Add mapping for backward comp
                if (data.ownerId) data.owner_id = data.ownerId;
                if (data.pricePerHour) data.hourly_rate = data.pricePerHour;
                if (data.spaceId) data.spot_id = data.spaceId;

                const payload = {
                    eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
                    new: data,
                    old: change.type !== 'added' ? data : null
                };
                
                callback(payload);
            });
        });

        return () => unsubscribe();
    }, [table, callback]);
};
