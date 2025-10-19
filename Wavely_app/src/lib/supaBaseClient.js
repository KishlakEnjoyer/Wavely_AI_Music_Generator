// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bxqzjxyojibnnkbmopnf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cXpqeHlvamlibm5rYm1vcG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTU4NjAsImV4cCI6MjA3MzQ5MTg2MH0.XKdOkXmcaIyF3OC8Cw8OxM7by7cE9QLI36wmwBwEvB4п'

console.log('Using Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseKey)