import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { initTheme } from '@/lib/storage';
import { FlashMessage } from '@/components/FlashMessage';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GraduationCap } from 'lucide-react';

type AuthView = 'login' | 'register';

interface Message {
  text: string;
  type: 'success' | 'error' | 'warning';
}

const Index = () => {
  const { user, isLoading, isAuthenticated, isAdminUser, login, register, logout } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    initTheme();
  }, []);

  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'warning') => {
    setMessage({ text, type });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (isAdminUser) {
      return (
        <>
          {message && <FlashMessage message={message.text} type={message.type} onClose={clearMessage} />}
          <AdminDashboard user={user} onLogout={logout} onShowMessage={showMessage} />
        </>
      );
    }
    return (
      <>
        {message && <FlashMessage message={message.text} type={message.type} onClose={clearMessage} />}
        <StudentDashboard user={user} onLogout={logout} onShowMessage={showMessage} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      {message && <FlashMessage message={message.text} type={message.type} onClose={clearMessage} />}
      <header className="p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">منصتنا</h1>
              <p className="text-xs text-muted-foreground">منصة الاختبارات الإلكترونية</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authView === 'login' ? (
            <LoginForm onLogin={login} onShowMessage={showMessage} onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterForm onRegister={register} onShowMessage={showMessage} onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} منصتنا - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default Index;
