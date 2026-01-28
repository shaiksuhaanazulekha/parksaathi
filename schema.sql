-- Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('driver', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Parking Spots Table
CREATE TABLE parking_spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  availability_json JSONB, -- For complex timing
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID REFERENCES parking_spots(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Paid', 'Refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  mode TEXT CHECK (mode IN ('UPI', 'Card', 'Wallet', 'Cash')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Success', 'Failed')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Earnings Table
CREATE TABLE earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;


-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parking spots are viewable by everyone" ON parking_spots FOR SELECT USING (true);
CREATE POLICY "Owners can manage own spots" ON parking_spots FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Bookings viewable by driver or owner" ON bookings FOR SELECT USING (
  auth.uid() = driver_id OR 
  auth.uid() IN (SELECT owner_id FROM parking_spots WHERE id = spot_id)
);
CREATE POLICY "Drivers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = driver_id);
