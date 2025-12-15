
-- Create enums for item types and statuses
CREATE TYPE public.item_type AS ENUM ('lost', 'found', 'anonymous');
CREATE TYPE public.item_status AS ENUM ('active', 'matched', 'recovered', 'closed');
CREATE TYPE public.match_status AS ENUM ('pending', 'confirmed', 'rejected');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'denied');

-- Create items table for all lost/found/anonymous reports
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  type public.item_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  color TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  status public.item_status NOT NULL DEFAULT 'active',
  image_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for AI matching results
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  found_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  status public.match_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_requests table for anonymous item claims
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  requester_message TEXT,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Items RLS Policies
CREATE POLICY "Users can insert their own items"
ON public.items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
ON public.items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
ON public.items FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active items"
ON public.items FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

-- Matches RLS Policies
CREATE POLICY "Users can view their own matches"
ON public.matches FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.items WHERE id = lost_item_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.items WHERE id = found_item_id AND user_id = auth.uid())
);

CREATE POLICY "Service role can insert matches"
ON public.matches FOR INSERT
WITH CHECK (true);

-- Contact Requests RLS Policies
CREATE POLICY "Users can create contact requests"
ON public.contact_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view requests for their items or their own requests"
ON public.contact_requests FOR SELECT
USING (
  auth.uid() = requester_id
  OR EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = auth.uid())
);

CREATE POLICY "Item owners can update request status"
ON public.contact_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- Storage policies for item images
CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for items and matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_requests;
