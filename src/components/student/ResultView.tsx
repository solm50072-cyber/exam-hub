import { Trophy, Star, Home, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamResult, Exam } from '@/lib/storage';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

interface ResultViewProps {
  result: ExamResult;
  exam: Exam;
  answers: Record<number, number>;
  onGoHome: () => void;
}

export const ResultView = ({ result, exam, answers, onGoHome }: ResultViewProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const percentage = (result.score / 20) * 100;
  const isPassing = percentage >= 50;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getGradeEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 75) return '⭐';
    if (percentage >= 50) return '👍';
    return '📚';
  };

  const getGradeText = () => {
    if (percentage >= 90) return 'ممتاز!';
    if (percentage >= 75) return 'جيد جداً';
    if (percentage >= 50) return 'جيد';
    return 'يحتاج مزيد من الدراسة';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {showConfetti && isPassing && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Result Card */}
        <Card className={`text-center animate-fade-in ${isPassing ? 'border-success' : 'border-warning'}`}>
          <CardHeader className="pb-4">
            <div className="mx-auto text-6xl mb-4">{getGradeEmoji()}</div>
            <CardTitle className="text-3xl font-bold">{getGradeText()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`text-6xl font-bold ${isPassing ? 'text-success' : 'text-warning'}`}>
              {result.score} / 20
            </div>
            <div className="text-lg text-muted-foreground">
              لقد أجبت بشكل صحيح على {Math.round(result.score / (20 / exam.questions.length))} من {exam.questions.length} سؤال
            </div>
            
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-8 w-8 ${i < Math.ceil(percentage / 20) ? 'fill-warning text-warning' : 'text-muted'}`} 
                />
              ))}
            </div>

            <Button 
              onClick={onGoHome} 
              size="lg" 
              className="gradient-primary text-primary-foreground gap-2 px-8"
            >
              <Home className="h-5 w-5" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>

        {/* Answers Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">مراجعة الإجابات</h2>
          {exam.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <Card key={index} className={`${isCorrect ? 'border-success/30' : 'border-destructive/30'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-3">{question.text}</p>
                      <div className="space-y-2 text-sm">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`p-2 rounded ${
                              optIndex === question.correctAnswer 
                                ? 'bg-success/10 text-success font-medium' 
                                : optIndex === userAnswer && !isCorrect
                                  ? 'bg-destructive/10 text-destructive line-through'
                                  : ''
                            }`}
                          >
                            {option}
                            {optIndex === question.correctAnswer && ' ✓'}
                            {optIndex === userAnswer && !isCorrect && ' (إجابتك)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
