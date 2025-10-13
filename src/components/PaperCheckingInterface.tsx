
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useAnswerSheets } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { FileText, Save, Plus, Minus, Eye, Upload, Check, X, PenTool, MessageCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker using jsDelivr CDN for proper CORS support
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PaperCheckingInterface = () => {
  const { user } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [marks, setMarks] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [annotationMode, setAnnotationMode] = useState<'none' | 'mark' | 'comment'>('none');
  const [totalObtainedMarks, setTotalObtainedMarks] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get current user profile ID
  // useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     if (user?.id) {
  //       const { data } = await supabase
  //         .from('profiles')
  //         .select('id')
  //         .eq('user_id', user.id)
  //         .single();
        
  //       if (data) {
  //         setCurrentUserId(data.id);
  //       }
  //     }
  //   };
  //   fetchCurrentUser();
  // }, [user?.id]);


// Get current teacher ID
useEffect(() => {
  const fetchCurrentTeacher = async () => {
    if (user?.id) {
      const { data, error } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setCurrentUserId(data.id);
      } else {
        console.error('Teacher not found:', error);
        // Handle case where user is not a teacher
        toast.error('Teacher profile not found. Please contact administrator.');
      }
    }
  };
  
  fetchCurrentTeacher();
}, [user?.id]);
  // Fetch answer sheets assigned to current teacher
  const { answerSheets, loading } = useAnswerSheets(currentUserId || undefined, user?.user_metadata?.role);

  // Filter only pending/ungraded papers
  const pendingPapers = answerSheets.filter(sheet => sheet.grading_status === 'pending');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. Please check the file and try again.');
  };

  const getPdfUrl = (fileUrl: string) => {
    if (!fileUrl) {
      console.log('No file URL provided, using sample PDF');
      return '/sample-answer-sheet.pdf';
    }
    
    // If it's already a full URL, return it
    if (fileUrl.startsWith('http')) {
      console.log('Using full URL:', fileUrl);
      return fileUrl;
    }
    
    // If it's a Supabase storage path, get the public URL
    const { data } = supabase.storage
      .from('answer-sheets')
      .getPublicUrl(fileUrl);
    
    console.log('Generated Supabase URL:', data.publicUrl);
    return data.publicUrl;
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages));
  };

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(newScale, 0.5), 3.0));
  };

  const handleQuestionMarks = (questionNumber: string, marks: number) => {
    setMarks(prev => ({ ...prev, [questionNumber]: marks }));
    calculateTotal();
  };

  const handleQuestionComment = (questionNumber: string, comment: string) => {
    setComments(prev => ({ ...prev, [questionNumber]: comment }));
  };

  const calculateTotal = () => {
    const total = Object.values(marks).reduce((sum, mark) => sum + mark, 0);
    setTotalObtainedMarks(total);
  };

  const handleSavePaper = async () => {
    if (!selectedPaper || !currentUserId) {
      toast.error('Please select a paper and ensure you are logged in');
      return;
    }

    try {
      // Update answer sheet with grades
      const { error: updateError } = await supabase
        .from('answer_sheets')
        .update({
          obtained_marks: totalObtainedMarks,
          graded_by: currentUserId,
          graded_at: new Date().toISOString(),
          grading_status: 'completed',
          remarks: Object.entries(comments).map(([q, c]) => `Q${q}: ${c}`).join('\n')
        })
        .eq('id', selectedPaper.id);

      if (updateError) throw updateError;

      // Save individual question marks
      const questionMarks = Object.entries(marks).map(([questionNumber, obtainedMarks]) => ({
        answer_sheet_id: selectedPaper.id,
        question_number: parseInt(questionNumber),
        obtained_marks: obtainedMarks,
        max_marks: 10, // Default max marks per question
        graded_by: currentUserId,
        graded_at: new Date().toISOString(),
        comments: comments[questionNumber] || null
      }));

      const { error: marksError } = await supabase
        .from('answer_sheet_questions')
        .upsert(questionMarks);

      if (marksError) throw marksError;

      // Save annotations if any
      if (annotations.length > 0) {
        const annotationData = annotations.map(annotation => ({
          answer_sheet_id: selectedPaper.id,
          page_number: annotation.page,
          x_position: annotation.x,
          y_position: annotation.y,
          annotation_type: annotation.type,
          content: annotation.content,
          color: annotation.color || '#000000',
          created_by: currentUserId
        }));

        const { error: annotationError } = await supabase
          .from('answer_sheet_annotations')
          .insert(annotationData);

        if (annotationError) throw annotationError;
      }

      toast.success('Paper graded and saved successfully!');
      setSelectedPaper(null);
      setMarks({});
      setComments({});
      setAnnotations([]);
      setTotalObtainedMarks(0);
    } catch (error) {
      console.error('Error saving paper:', error);
      toast.error('Failed to save paper grades');
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (annotationMode === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newAnnotation = {
      id: Date.now(),
      page: pageNumber,
      x: x / scale,
      y: y / scale,
      type: annotationMode,
      content: annotationMode === 'comment' ? prompt('Enter comment:') || '' : '',
      color: annotationMode === 'mark' ? '#ff0000' : '#0000ff'
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading papers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Paper Checking Interface</h2>
        <Badge variant="secondary">{pendingPapers.length} papers pending</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Papers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Papers
            </CardTitle>
            <CardDescription>Select a paper to start grading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPapers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending papers to grade</p>
            ) : (
              pendingPapers.map((paper) => (
                <Card 
                  key={paper.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedPaper?.id === paper.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPaper(paper)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">{paper.student?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {paper.exam?.subject?.name} - {paper.exam?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(paper.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* PDF Viewer and Grading Interface */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPaper ? (
            <>
              {/* PDF Viewer */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Answer Sheet: {selectedPaper.student?.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnnotationMode(annotationMode === 'mark' ? 'none' : 'mark')}
                        className={annotationMode === 'mark' ? 'bg-red-100' : ''}
                      >
                        <PenTool className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnnotationMode(annotationMode === 'comment' ? 'none' : 'comment')}
                        className={annotationMode === 'comment' ? 'bg-blue-100' : ''}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* PDF Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                          Page {pageNumber} of {numPages}
                        </span>
                        <Button size="sm" onClick={() => changePage(1)} disabled={pageNumber >= numPages}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => changeScale(scale - 0.1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{Math.round(scale * 100)}%</span>
                        <Button size="sm" onClick={() => changeScale(scale + 0.1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* PDF Display */}
                    <div className="relative border rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 z-10 cursor-crosshair"
                        onClick={handleCanvasClick}
                        style={{ display: annotationMode !== 'none' ? 'block' : 'none' }}
                      />
                      {pdfError ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                          <p className="text-red-500 mb-2">Error loading PDF</p>
                          <p className="text-sm text-muted-foreground">{pdfError}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPdfError(null)}
                            className="mt-4"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : (
                        <Document
                          file={getPdfUrl(selectedPaper.file_url)}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          className="flex justify-center"
                          loading={
                            <div className="flex items-center justify-center p-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <span className="ml-2">Loading PDF...</span>
                            </div>
                          }
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </Document>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grading Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Paper</CardTitle>
                  <CardDescription>Enter marks and comments for each question</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quick grade inputs for common questions */}
                    <ScrollArea className="h-96 pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((questionNumber) => (
                          <div key={questionNumber} className="space-y-2">
                            <Label>Question {questionNumber}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Marks"
                                value={marks[questionNumber] || ''}
                                onChange={(e) => handleQuestionMarks(questionNumber.toString(), parseFloat(e.target.value) || 0)}
                                className="w-20"
                              />
                              <Input
                                placeholder="Comment (optional)"
                                value={comments[questionNumber] || ''}
                                onChange={(e) => handleQuestionComment(questionNumber.toString(), e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-semibold">
                        Total Marks: {totalObtainedMarks} / {selectedPaper.total_marks || 100}
                      </div>
                      <Button onClick={handleSavePaper} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save & Submit Grade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sample Answer Sheet</CardTitle>
                <CardDescription>Select a paper from the list to start grading, or view the sample below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* PDF Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {pageNumber} of {numPages}
                      </span>
                      <Button size="sm" onClick={() => changePage(1)} disabled={pageNumber >= numPages}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => changeScale(scale - 0.1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">{Math.round(scale * 100)}%</span>
                      <Button size="sm" onClick={() => changeScale(scale + 0.1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Sample PDF Display */}
                  <div className="relative border rounded-lg overflow-hidden">
                    {pdfError ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-red-500 mb-2">Error loading PDF</p>
                        <p className="text-sm text-muted-foreground">{pdfError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPdfError(null)}
                          className="mt-4"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <Document
                        file="/sample-answer-sheet.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        className="flex justify-center"
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading PDF...</span>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pageNumber}
                          scale={scale}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperCheckingInterface;
