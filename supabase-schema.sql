-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    tags TEXT,
    type TEXT NOT NULL,
    images TEXT[] NOT NULL,
    colors TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    hex TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read posts
CREATE POLICY "Anyone can view posts" ON posts
    FOR SELECT USING (true);

-- Policy: Anyone can insert posts (no auth required)
CREATE POLICY "Anyone can insert posts" ON posts
    FOR INSERT WITH CHECK (true);

-- Policy: Anyone can delete posts (no auth required)
CREATE POLICY "Anyone can delete posts" ON posts
    FOR DELETE USING (true);

-- Policy: Anyone can update posts
CREATE POLICY "Anyone can update posts" ON posts
    FOR UPDATE USING (true);

-- Policy: Anyone can view colors
CREATE POLICY "Anyone can view colors" ON colors
    FOR SELECT USING (true);

-- Policy: Anyone can insert colors
CREATE POLICY "Anyone can insert colors" ON colors
    FOR INSERT WITH CHECK (true);

-- Policy: Anyone can delete colors
CREATE POLICY "Anyone can delete colors" ON colors
    FOR DELETE USING (true);
