-- 1. Create the custom_frames table
CREATE TABLE IF NOT EXISTS public.custom_frames (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    border_color TEXT NOT NULL,
    text_color TEXT DEFAULT '#ffffff'
);

-- 2. Disable Row Level Security for the table (Allows anyone to insert/read without login)
-- NOTE: In a real production app you might want to restrict inserts to authenticated admins.
ALTER TABLE public.custom_frames DISABLE ROW LEVEL SECURITY;

-- 3. Create the Storage Bucket called 'frames' (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('frames', 'frames', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up permissive policies for the 'frames' bucket so anyone can upload and read
-- Allow public read access to the frames bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'frames' );

-- Allow public insert (upload) access to the frames bucket
CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'frames' );

-- Allow public delete access (optional, if you want users to be able to delete their frames)
CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'frames' );
