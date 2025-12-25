import { useState, useEffect, useCallback } from 'react';
import {
  User,
  getCurrentUser,
  setCurrentUser,
  findUserByUsername,
  saveUser,
  isAdmin,
  generateId,
} from '@/lib/storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

interface LoginResult {
  success: boolean;
  message: string;
}

interface RegisterResult {
  success: boolean;
  message: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const user = getCurrentUser();
    setAuthState({ user, isLoading: false });
  }, []);

  const login = useCallback((username: string, password: string): LoginResult => {
    const user = findUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'اسم المستخدم غير موجود' };
    }
    
    if (user.password !== password) {
      return { success: false, message: 'كلمة المرور غير صحيحة' };
    }
    
    setCurrentUser(user);
    setAuthState({ user, isLoading: false });
    return { success: true, message: 'تم تسجيل الدخول بنجاح' };
  }, []);

  const register = useCallback((
    username: string,
    password: string,
    grade?: string
  ): RegisterResult => {
    if (findUserByUsername(username)) {
      return { success: false, message: 'اسم المستخدم موجود بالفعل' };
    }
    
    if (username.length < 3) {
      return { success: false, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
    }
    
    if (password.length < 4) {
      return { success: false, message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' };
    }
    
    const newUser: User = {
      id: generateId(),
      username,
      password,
      role: isAdmin(username) ? 'admin' : 'student',
      grade: isAdmin(username) ? undefined : grade,
      createdAt: new Date().toISOString(),
    };
    
    saveUser(newUser);
    setCurrentUser(newUser);
    setAuthState({ user: newUser, isLoading: false });
    return { success: true, message: 'تم إنشاء الحساب بنجاح' };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthState({ user: null, isLoading: false });
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
    isAdminUser: authState.user?.role === 'admin',
    login,
    register,
    logout,
  };
};
