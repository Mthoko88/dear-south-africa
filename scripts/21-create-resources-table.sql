-- Create resources table for community support directory
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    contact_info JSONB, -- phone, email, website, address
    location VARCHAR(255),
    province VARCHAR(100),
    is_crisis_support BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_province ON public.resources(province);
CREATE INDEX IF NOT EXISTS idx_resources_is_crisis_support ON public.resources(is_crisis_support);
CREATE INDEX IF NOT EXISTS idx_resources_is_verified ON public.resources(is_verified);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Resources are viewable by everyone" ON public.resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can suggest resources" ON public.resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own resources" ON public.resources
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own resources" ON public.resources
    FOR DELETE USING (auth.uid() = created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample South African resources
INSERT INTO public.resources (title, description, category, contact_info, location, province, is_crisis_support, is_verified, tags) VALUES
('Lifeline South Africa', '24/7 crisis counselling and suicide prevention', 'Mental Health', '{"phone": "0861 322 322", "website": "https://www.lifeline.org.za"}', 'National', 'All Provinces', true, true, ARRAY['crisis', 'suicide prevention', 'counselling']),
('SAPS Crisis Line', 'South African Police Service emergency line', 'Emergency Services', '{"phone": "10111", "website": "https://www.saps.gov.za"}', 'National', 'All Provinces', true, true, ARRAY['emergency', 'police', 'crime']),
('Legal Aid South Africa', 'Free legal services for qualifying individuals', 'Legal Support', '{"phone": "0800 110 110", "website": "https://www.legal-aid.co.za"}', 'National', 'All Provinces', false, true, ARRAY['legal aid', 'free legal services']),
('SADAG - Depression and Anxiety', 'Mental health support and resources', 'Mental Health', '{"phone": "0800 567 567", "website": "https://www.sadag.org"}', 'National', 'All Provinces', true, true, ARRAY['depression', 'anxiety', 'mental health']),
('Childline South Africa', '24/7 support for children in crisis', 'Child Protection', '{"phone": "116", "website": "https://www.childlinesa.org.za"}', 'National', 'All Provinces', true, true, ARRAY['children', 'abuse', 'crisis']),
('GBV Command Centre', 'Gender-based violence support', 'Gender-Based Violence', '{"phone": "0800 428 428", "website": "https://www.gbv.org.za"}', 'National', 'All Provinces', true, true, ARRAY['gender-based violence', 'domestic violence', 'women']),
('Triangle Project', 'LGBTQ+ support and advocacy', 'LGBTQ+ Support', '{"phone": "021 712 6699", "website": "https://triangle.org.za"}', 'Cape Town', 'Western Cape', false, true, ARRAY['LGBTQ+', 'advocacy', 'support']),
('FAMSA', 'Family and marriage counselling services', 'Family Support', '{"phone": "011 975 7106", "website": "https://www.famsa.org.za"}', 'National', 'All Provinces', false, true, ARRAY['family counselling', 'marriage', 'relationships']);
