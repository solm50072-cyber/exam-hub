import { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  onLogin: (username: string, password: string) => { success: boolean; message: string };
  onShowMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onLogin, onShowMessage, onSwitchToRegister }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      onShowMessage('يرجى ملء جميع الحقول', 'warning');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = onLogin(username.trim(), password);
    
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
          <LogIn className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>
          
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

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground font-semibold py-6"
            disabled={isLoading}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-muted-foreground">ليس لديك حساب؟ </span>
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
