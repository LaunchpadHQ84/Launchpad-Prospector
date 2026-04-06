import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ospwmkurvkylfgbqvcco.supabase.co'
const supabaseKey = 'sb_publishable_qm0i5v5AAKB2qgFd_ZZBnA_rTvDy1YC'

export const supabase = createClient(supabaseUrl, supabaseKey)
