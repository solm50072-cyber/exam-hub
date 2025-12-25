import { useState, useEffect } from 'react';
import { BookOpen, Trophy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExamCard } from './ExamCard';
import { ExamView } from './ExamView';
import { ResultView } from './ResultView';
import { 
  User, 
  Exam, 
  ExamResult, 
  getExamsByGrade, 
  getExamById,
  getResultsByUser,
  hasCompletedExam 
} from '@/lib/storage';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  onShowMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
}

type ViewState = 'list' | 'exam' | 'result';

export const StudentDashboard = ({ user, onLogout, onShowMessage }: StudentDashboardProps) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('list');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (user.grade) {
      setExams(getExamsByGrade(user.grade));
      setResults(getResultsByUser(user.id));
    }
  }, [user]);

  const handleStartExam = (examId: string) => {
    if (hasCompletedExam(user.id, examId)) {
      onShowMessage('لقد أكملت هذا الامتحان من قبل', 'warning');
      return;
    }

    const exam = getExamById(examId);
    if (exam) {
      setSelectedExam(exam);
      setExamAnswers({});
      setCurrentView('exam');
    }
  };

  const handleExamComplete = (result: ExamResult) => {
    setCurrentResult(result);
    setResults([...results, result]);
    setCurrentView('result');
    onShowMessage(`تم تسليم الامتحان! درجتك: ${result.score} / 20`, 'success');
  };

  const handleGoHome = () => {
    setCurrentView('list');
    setSelectedExam(null);
    setCurrentResult(null);
    setExamAnswers({});
    setExams(getExamsByGrade(user.grade!));
    setResults(getResultsByUser(user.id));
  };

  // Calculate stats
  const completedCount = results.length;
  const averageScore = completedCount > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / completedCount)
    : 0;

  if (currentView === 'exam' && selectedExam) {
    return (
      <ExamView
        exam={selectedExam}
        user={user}
        onComplete={handleExamComplete}
        onCancel={handleGoHome}
      />
    );
  }

  if (currentView === 'result' && currentResult && selectedExam) {
    return (
      <ResultView
        result={currentResult}
        exam={selectedExam}
        answers={examAnswers}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg gradient-text">منصتنا</h1>
                <p className="text-xs text-muted-foreground">مرحباً، {user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">رؤية اختبارات {user.grade}</h2>
          <p className="text-muted-foreground">اختر امتحاناً للبدء</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center card-hover">
            <div className="text-3xl font-bold text-primary">{exams.length}</div>
            <div className="text-sm text-muted-foreground">امتحانات متاحة</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center card-hover">
            <div className="text-3xl font-bold text-success">{completedCount}</div>
            <div className="text-sm text-muted-foreground">امتحانات مكتملة</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center card-hover">
            <div className="text-3xl font-bold text-warning">{exams.length - completedCount}</div>
            <div className="text-sm text-muted-foreground">امتحانات متبقية</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center card-hover">
            <div className="text-3xl font-bold gradient-text">{averageScore}</div>
            <div className="text-sm text-muted-foreground">متوسط الدرجات</div>
          </div>
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد امتحانات متاحة حالياً</h3>
            <p className="text-muted-foreground">سيتم إضافة امتحانات جديدة قريباً</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                result={results.find(r => r.examId === exam.id)}
                onStartExam={handleStartExam}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
