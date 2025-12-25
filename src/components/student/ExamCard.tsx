import { FileText, Clock, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Exam, ExamResult } from '@/lib/storage';

interface ExamCardProps {
  exam: Exam;
  result?: ExamResult;
  onStartExam: (examId: string) => void;
}

export const ExamCard = ({ exam, result, onStartExam }: ExamCardProps) => {
  const isCompleted = !!result;
  const formattedDate = new Date(exam.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className={`card-hover ${isCompleted ? 'border-success/50' : 'border-primary/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-success/10' : 'bg-primary/10'}`}>
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <FileText className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{exam.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-success text-success-foreground">
              {result.score} / {result.totalQuestions * (20 / result.totalQuestions)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {exam.questions.length} سؤال
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              15 دقيقة
            </span>
          </div>
          
          {isCompleted ? (
            <Button variant="secondary" disabled className="gap-2">
              <Lock className="h-4 w-4" />
              تم الإنتهاء
            </Button>
          ) : (
            <Button 
              onClick={() => onStartExam(exam.id)}
              className="gradient-primary text-primary-foreground gap-2"
            >
              ابدأ الامتحان
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
