import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID and new password are required.' });
  }

  console.log('Received userId:', userId);
  console.log('Received newPassword (first 3 chars):', newPassword ? newPassword.substring(0, 3) : 'N/A');

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Supabase admin update user error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Password updated successfully.', user: data.user });
  } catch (error) {
    console.error('Server error in API route:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
