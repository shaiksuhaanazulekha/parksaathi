require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, fullName, userType } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, user_type: userType }
            }
        });
        if (error) throw error;

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, email, full_name: fullName, user_type: userType }]);

        if (profileError) throw profileError;

        res.status(201).json({ user: data.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        res.json({ session: data.session, user: data.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Parking Routes
app.get('/api/search-parking', async (req, res) => {
    const { lat, lng, radius = 5, filters } = req.query;
    try {
        // In a real app, use PostGIS for proximity search
        // Here we'll just fetch all or some mock logic
        const { data, error } = await supabase
            .from('parking_spots')
            .select('*');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { spot_id, start_time, end_time, total_price, driver_id } = req.body;
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                spot_id,
                driver_id,
                start_time,
                end_time,
                total_price,
                status: 'Confirmed'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/bookings/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, parking_spots(*)')
            .eq('driver_id', userId);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
