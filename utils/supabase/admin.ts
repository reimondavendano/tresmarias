// utils/supabase/admin.ts

import { supabaseService } from '@/utils/supabase/client/supaBaseClient';
import bcrypt from 'bcryptjs';
import { Admin, AdminCredentials, AdminResponse } from '@/types';

/**
 * Authenticates an admin user with username and password.
 */
export const authenticateAdmin = async (
  credentials: AdminCredentials
): Promise<[AdminResponse | null, any | null]> => {
  try {
    const { username, password } = credentials;

    const { data: admin, error } = await supabaseService // <-- Use supabaseService
      .from('tbl_admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return [null, { message: 'Invalid username or password' }];
      }
      console.error('Admin Service Error: Failed to fetch admin:', error.message);
      return [null, error];
    }

    if (!admin) {
      return [null, { message: 'Invalid username or password' }];
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return [null, { message: 'Invalid username or password' }];
    }

    const adminResponse: AdminResponse = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    };

    return [adminResponse, null];
  } catch (error) {
    console.error('Admin Service Error: Unexpected error in authenticateAdmin:', error);
    return [null, error];
  }
};

/**
 * Creates a new admin user (for initial setup or admin management).
 */
export const createAdmin = async (adminData: {
  username: string;
  email: string;
  password: string;
}): Promise<[AdminResponse | null, any | null]> => {
  try {
    const { username, email, password } = adminData;

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data: admin, error } = await supabaseService // <-- Use supabaseService
      .from('tbl_admin_users')
      .insert([{
        username,
        email,
        password_hash,
        is_active: true,
      }])
      .select('id, username, email')
      .single();

    if (error) {
      console.error('Admin Service Error: Failed to create admin:', error.message);
      return [null, error];
    }

    return [admin as AdminResponse, null];
  } catch (error) {
    console.error('Admin Service Error: Unexpected error in createAdmin:', error);
    return [null, error];
  }
};

/**
 * Fetches an admin by ID.
 */
export const fetchAdminById = async (id: string): Promise<[AdminResponse | null, any | null]> => {
  try {
    const { data: admin, error } = await supabaseService // <-- Use supabaseService
      .from('tbl_admin_users')
      .select('id, username, email, is_active')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Admin Service Error: Failed to fetch admin:', error.message);
      return [null, error];
    }

    return [admin as AdminResponse, null];
  } catch (error) {
    console.error('Admin Service Error: Unexpected error in fetchAdminById:', error);
    return [null, error];
  }
};

/**
 * Updates admin password.
 */
export const updateAdminPassword = async (
  id: string,
  newPassword: string
): Promise<[boolean, any | null]> => {
  try {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const { error } = await supabaseService // <-- Use supabaseService
      .from('tbl_admin_users')
      .update({ password_hash })
      .eq('id', id);

    if (error) {
      console.error('Admin Service Error: Failed to update password:', error.message);
      return [false, error];
    }

    return [true, null];
  } catch (error) {
    console.error('Admin Service Error: Unexpected error in updateAdminPassword:', error);
    return [false, error];
  }
};