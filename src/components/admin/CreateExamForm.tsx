import { useState } from 'react';
import { Plus, Trash2, Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GRADES, Exam, Question, generateId, saveExam, User } from '@/lib/storage';

interface CreateExamFormProps {
  user: User;
  onExamCreated: () => void;
  onShowMessage: (message: string, type: 'success' | 'error' | 'warning') => void;
}

interface QuestionInput {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export const CreateExamForm = ({ user, onExamCreated, onShowMessage }: CreateExamFormProps) => {
  const [examName, setExamName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { id: generateId(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: generateId(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: string | number | string[]) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!examName.trim()) {
      onShowMessage('يرجى إدخال اسم الامتحان', 'warning');
      return;
    }

    if (!selectedGrade) {
      onShowMessage('يرجى اختيار الصف الدراسي', 'warning');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        onShowMessage(`يرجى إدخال نص السؤال ${i + 1}`, 'warning');
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          onShowMessage(`يرجى إدخال جميع الخيارات للسؤال ${i + 1}`, 'warning');
          return;
        }
      }
    }

    setIsSubmitting(true);

    const exam: Exam = {
      id: generateId(),
      name: examName.trim(),
      grade: selectedGrade,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text.trim(),
        options: q.options.map(o => o.trim()),
        correctAnswer: q.correctAnswer,
      })),
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    
    saveExam(exam);
    onShowMessage('تم إنشاء الامتحان بنجاح!', 'success');
    onExamCreated();

    // Reset form
    setExamName('');
    setSelectedGrade('');
    setQuestions([{ id: generateId(), text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setIsSubmitting(false);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          إنشاء امتحان جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exam Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examName">اسم الامتحان</Label>
              <Input
                id="examName"
                placeholder="مثال: امتحان الشهر الأول"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>الصف الدراسي</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">الأسئلة ({questions.length})</Label>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                إضافة سؤال
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={question.id} className="border-2 border-dashed">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>السؤال {qIndex + 1}</Label>
                      <Textarea
                        placeholder="أدخل نص السؤال"
                        value={question.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        disabled={isSubmitting}
                        rows={2}
                      />
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>الخيارات (اختر الإجابة الصحيحة)</Label>
                    <RadioGroup
                      value={question.correctAnswer.toString()}
                      onValueChange={(value) => updateQuestion(qIndex, 'correctAnswer', parseInt(value))}
                      className="space-y-2"
                    >
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                          <Input
                            placeholder={`الخيار ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            disabled={isSubmitting}
                            className="flex-1"
                          />
                          {question.correctAnswer === oIndex && (
                            <span className="text-xs text-success font-medium">صحيح</span>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground py-6 gap-2"
            disabled={isSubmitting}
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الامتحان'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
