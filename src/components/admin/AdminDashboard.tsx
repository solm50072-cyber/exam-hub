import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Users, LogOut, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CreateExamForm } from './CreateExamForm';
import { ResultsTable } from './ResultsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Exam, 
  ExamResult, 
  getExams, 
  getResults, 
  deleteExam,
  GRADES 
} from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onShowMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export const AdminDashboard = ({ user, onLogout, onShowMessage }: AdminDashboardProps) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState('create');

  const loadData = () => {
    setExams(getExams());
    setResults(getResults());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteExam = (examId: string) => {
    deleteExam(examId);
    loadData();
    onShowMessage('تم حذف الامتحان بنجاح', 'success');
  };

  // Stats
  const totalStudents = new Set(results.map(r => r.userId)).size;
  const examsByGrade = GRADES.reduce((acc, grade) => {
    acc[grade] = exams.filter(e => e.grade === grade).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg gradient-text">لوحة التحكم</h1>
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
          <h2 className="text-3xl font-bold mb-2">إعداد الامتحان القادم</h2>
          <p className="text-muted-foreground">إدارة الامتحانات ومتابعة نتائج الطلاب</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="pt-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold">{exams.length}</div>
              <div className="text-sm text-muted-foreground">إجمالي الامتحانات</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-3xl font-bold">{totalStudents}</div>
              <div className="text-sm text-muted-foreground">طلاب مشاركون</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-warning">{results.length}</div>
              <div className="text-sm text-muted-foreground">نتائج مسجلة</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold gradient-text">
                {exams.reduce((acc, e) => acc + e.questions.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">إجمالي الأسئلة</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء امتحان
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="h-4 w-4" />
              الامتحانات
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <Users className="h-4 w-4" />
              النتائج
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <CreateExamForm 
              user={user} 
              onExamCreated={loadData}
              onShowMessage={onShowMessage}
            />
          </TabsContent>

          <TabsContent value="exams">
            <div className="space-y-4">
              {exams.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    لا توجد امتحانات بعد. قم بإنشاء امتحان جديد.
                  </CardContent>
                </Card>
              ) : (
                exams.map((exam) => (
                  <Card key={exam.id} className="card-hover">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{exam.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{exam.grade}</Badge>
                            <Badge variant="outline">{exam.questions.length} سؤال</Badge>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الامتحان</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف "{exam.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteExam(exam.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        تم الإنشاء: {new Date(exam.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="results">
            <ResultsTable results={results} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
