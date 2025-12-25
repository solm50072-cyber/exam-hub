import { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GRADES, isAdmin } from '@/lib/storage';

interface RegisterFormProps {
  onRegister: (username: string, password: string, grade?: string) => { success: boolean; message: string };
  onShowMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onRegister, onShowMessage, onSwitchToLogin }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdminUsername = isAdmin(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      onShowMessage('يرجى ملء جميع الحقول المطلوبة', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      onShowMessage('كلمتا المرور غير متطابقتين', 'error');
      return;
    }

    if (!isAdminUsername && !grade) {
      onShowMessage('يرجى اختيار الصف الدراسي', 'warning');
      return;
    }

    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = onRegister(username.trim(), password, isAdminUsername ? undefined : grade);
    
    if (result.success) {
      onShowMessage(result.message, 'success');
    } else {
      onShowMessage(result.message, 'error');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-effect animate-fade-in">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-right"
              disabled={isLoading}
            />
            {isAdminUsername && (
              <p className="text-sm text-success">سيتم تسجيلك كمسؤول</p>
            )}
          </div>

          {!isAdminUsername && (
            <div className="space-y-2">
              <Label>الصف الدراسي</Label>
              <Select value={grade} onValueChange={setGrade} disabled={isLoading}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الصف الدراسي" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right pl-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-right"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            تسجيل الدخول
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
