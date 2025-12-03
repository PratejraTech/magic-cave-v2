/*
  # Advent Calendar Schema

  1. New Tables
    - `advent_days`
      - `id` (integer, primary key) - Day number (1-31)
      - `message` (text) - Hidden message for the day
      - `photo_url` (text) - URL to the day's photo
      - `is_opened` (boolean) - Whether the day has been opened
      - `opened_at` (timestamptz) - When the day was opened
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `advent_days` table
    - Add policy for anyone to read all advent days
    - Add policy for anyone to update opened status

  3. Notes
    - This is a personal advent calendar for a child
    - Public access is allowed since it's a single-user family application
*/

CREATE TABLE IF NOT EXISTS advent_days (
  id integer PRIMARY KEY CHECK (id >= 1 AND id <= 31),
  message text NOT NULL,
  photo_url text NOT NULL,
  is_opened boolean DEFAULT false,
  opened_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advent_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read advent days"
  ON advent_days FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update opened status"
  ON advent_days FOR UPDATE
  USING (true)
  WITH CHECK (true);

INSERT INTO advent_days (id, message, photo_url) VALUES
  (1, 'You are loved more than all the stars in the sky! ✨', 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (2, 'Your smile makes every day brighter! 🌟', 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (3, 'You are brave, strong, and amazing! 💪', 'https://images.pexels.com/photos/1086584/pexels-photo-1086584.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (4, 'Every day with you is magical! ✨', 'https://images.pexels.com/photos/1415274/pexels-photo-1415274.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (5, 'You make the world a better place! 🌍', 'https://images.pexels.com/photos/1252983/pexels-photo-1252983.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (6, 'Your laugh is the best sound ever! 😄', 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (7, 'You are kind and wonderful! 💖', 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (8, 'Dreams come true when you believe! 🌈', 'https://images.pexels.com/photos/414181/pexels-photo-414181.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (9, 'You are my sunshine! ☀️', 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (10, 'You can do anything you set your mind to! 🎯', 'https://images.pexels.com/photos/1486861/pexels-photo-1486861.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (11, 'Your hugs are the best medicine! 🤗', 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (12, 'You make every moment special! ⭐', 'https://images.pexels.com/photos/1619654/pexels-photo-1619654.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (13, 'You are perfectly wonderful just as you are! 💝', 'https://images.pexels.com/photos/1912826/pexels-photo-1912826.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (14, 'Your imagination is incredible! 🎨', 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (15, 'You are loved beyond measure! 💕', 'https://images.pexels.com/photos/1835718/pexels-photo-1835718.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (16, 'Every day you grow more amazing! 🌱', 'https://images.pexels.com/photos/1183434/pexels-photo-1183434.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (17, 'Your creativity lights up the room! 💡', 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (18, 'You are a gift to everyone around you! 🎁', 'https://images.pexels.com/photos/1543895/pexels-photo-1543895.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (19, 'Your joy is contagious! 😊', 'https://images.pexels.com/photos/1612847/pexels-photo-1612847.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (20, 'You make everything more fun! 🎉', 'https://images.pexels.com/photos/1490844/pexels-photo-1490844.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (21, 'Your heart is full of love! 💗', 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (22, 'You are braver than you know! 🦁', 'https://images.pexels.com/photos/1661546/pexels-photo-1661546.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (23, 'Your curiosity is wonderful! 🔍', 'https://images.pexels.com/photos/1912569/pexels-photo-1912569.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (24, 'You are my greatest treasure! 💎', 'https://images.pexels.com/photos/1912847/pexels-photo-1912847.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (25, 'Merry Christmas! You make this day magical! 🎄', 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (26, 'Your happiness fills my heart! 💓', 'https://images.pexels.com/photos/1912175/pexels-photo-1912175.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (27, 'You are smart and clever! 🧠', 'https://images.pexels.com/photos/1912176/pexels-photo-1912176.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (28, 'Your spirit is beautiful! 🦋', 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (29, 'You bring color to every day! 🌺', 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (30, 'You are extraordinary in every way! 🌟', 'https://images.pexels.com/photos/1619791/pexels-photo-1619791.jpeg?auto=compress&cs=tinysrgb&w=400'),
  (31, 'Happy New Year! Here''s to more adventures together! 🎊', 'https://images.pexels.com/photos/1708601/pexels-photo-1708601.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (id) DO NOTHING;