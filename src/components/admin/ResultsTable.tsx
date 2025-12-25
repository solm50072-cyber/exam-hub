import { useState, useMemo } from 'react';
import { Search, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ExamResult, GRADES } from '@/lib/storage';

interface ResultsTableProps {
  results: ExamResult[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r => r.username.toLowerCase().includes(query) || 
             r.examName.toLowerCase().includes(query)
      );
    }

    // Filter by grade
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(r => r.grade === gradeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      return b.score - a.score;
    });

    return filtered;
  }, [results, searchQuery, gradeFilter, sortBy]);

  const stats = useMemo(() => {
    if (results.length === 0) return { avg: 0, highest: 0, lowest: 0, passing: 0 };
    
    const scores = results.map(r => r.score);
    const passing = results.filter(r => r.score >= 10).length;
    
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passing: Math.round((passing / results.length) * 100),
    };
  }, [results]);

  const exportToCSV = () => {
    const headers = ['الطالب', 'الامتحان', 'الصف', 'الدرجة', 'التاريخ'];
    const rows = filteredResults.map(r => [
      r.username,
      r.examName,
      r.grade,
      `${r.score}/20`,
      new Date(r.completedAt).toLocaleDateString('ar-EG'),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'نتائج_الامتحانات.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-primary">{results.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي النتائج</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-success">{stats.avg}</div>
            <div className="text-sm text-muted-foreground">متوسط الدرجات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5 text-success" />
              {stats.highest}
            </div>
            <div className="text-sm text-muted-foreground">أعلى درجة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{stats.passing}%</div>
            <div className="text-sm text-muted-foreground">نسبة النجاح</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <span>جدول النتائج</span>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن طالب أو امتحان..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع الصفوف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'score')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">الأحدث أولاً</SelectItem>
                <SelectItem value="score">الأعلى درجة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد نتائج مطابقة للبحث
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الامتحان</TableHead>
                    <TableHead className="text-right">الصف</TableHead>
                    <TableHead className="text-right">الدرجة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.username}</TableCell>
                      <TableCell>{result.examName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {result.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={result.score >= 10 ? 'bg-success' : 'bg-destructive'}
                        >
                          {result.score} / 20
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(result.completedAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
