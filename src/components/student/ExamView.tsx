import { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Exam, ExamResult, generateId, saveResult, User } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamViewProps {
  exam: Exam;
  user: User;
  onComplete: (result: ExamResult) => void;
  onCancel: () => void;
}

const EXAM_DURATION = 15 * 60; // 15 minutes in seconds

export const ExamView = ({ exam, user, onComplete, onCancel }: ExamViewProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const calculateScore = useCallback(() => {
    let correct = 0;
    exam.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correct++;
      }
    });
    // Score out of 20
    return Math.round((correct / exam.questions.length) * 20);
  }, [answers, exam.questions]);

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    const score = calculateScore();
    
    const result: ExamResult = {
      id: generateId(),
      examId: exam.id,
      examName: exam.name,
      userId: user.id,
      username: user.username,
      grade: exam.grade,
      score,
      totalQuestions: exam.questions.length,
      completedAt: new Date().toISOString(),
    };
    
    saveResult(result);
    onComplete(result);
  }, [calculateScore, exam, user, onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeLeft < 60;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{exam.name}</h1>
            <p className="text-muted-foreground">{exam.grade}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isTimeWarning ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-secondary'
          }`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>السؤال {currentQuestion + 1} من {exam.questions.length}</span>
            <span>تم الإجابة على {answeredCount} أسئلة</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => {
                setAnswers({ ...answers, [currentQuestion]: parseInt(value) });
              }}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                    ${answers[currentQuestion] === index 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  onClick={() => setAnswers({ ...answers, [currentQuestion]: index })}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </Button>

          <div className="flex gap-2 flex-wrap justify-center">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all
                  ${currentQuestion === index 
                    ? 'gradient-primary text-primary-foreground' 
                    : answers[index] !== undefined
                      ? 'bg-success text-success-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < exam.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="gap-2"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              className="gradient-primary text-primary-foreground gap-2"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              تسليم الامتحان
            </Button>
          )}
        </div>

        {/* Unanswered warning */}
        {answeredCount < exam.questions.length && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 text-warning border border-warning/20">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>لم تقم بالإجابة على جميع الأسئلة ({exam.questions.length - answeredCount} أسئلة متبقية)</span>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من تسليم الامتحان؟</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < exam.questions.length 
                ? `لم تجب على ${exam.questions.length - answeredCount} أسئلة. هل تريد التسليم على أي حال؟`
                : 'لن تتمكن من تغيير إجاباتك بعد التسليم.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>العودة للامتحان</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
