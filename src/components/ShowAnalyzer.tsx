'use client';

import { useState, useEffect } from 'react';
import { Answer, AnalysisResponse, QuestionState, AnalyzeState } from '@/types/analyze';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, ThumbsUp, ThumbsDown, HelpCircle, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export const ShowAnalyzer = ({ show }: { show: string }) => {
  const [state, setState] = useState<AnalyzeState>({
    show,
    questions: [],
    currentQuestionIndex: 0,
    isAnalyzing: false,
    result: null,
    error: null,
  });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<QuestionState[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remainingUses: number;
    hoursUntilReset: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const generateQuestions = async () => {
      if (!show) return;
      
      try {
        setIsLoadingQuestions(true);
        const response = await fetch('/api/openai/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ show }),
        });

        // Get rate limit info from headers
        const remainingUses = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
        const hoursUntilReset = parseInt(response.headers.get('X-RateLimit-Reset-Hours') || '24');
        
        if (isMounted) {
          setRateLimitInfo({ remainingUses, hoursUntilReset });
        }

        if (response.status === 429) {
          const data = await response.json();
          throw new Error(data.message || 'Rate limit exceeded');
        }

        if (!response.ok) {
          throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        
        if (!isMounted) return;
        
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid response format');
        }

        setState(prev => ({
          ...prev,
          questions: data.questions.map((question: string) => ({
            question,
            answer: null,
          })),
          error: null,
        }));
      } catch (error) {
        if (!isMounted) return;
        
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to generate questions',
        }));
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    generateQuestions();
    
    return () => {
      isMounted = false;
    };
  }, [show]);

  const answerButtons: { value: Answer; icon: React.ReactNode; label: string; color: string }[] = [
    { 
      value: 'YES', 
      icon: <ThumbsUp className="w-5 h-5" />, 
      label: 'Yes, I remember',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      value: 'NO', 
      icon: <ThumbsDown className="w-5 h-5" />, 
      label: 'No, I don\'t',
      color: 'bg-red-500 hover:bg-red-600'
    },
    { 
      value: 'NOT_SURE', 
      icon: <HelpCircle className="w-5 h-5" />, 
      label: 'Not sure',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
  ];

  const handleAnswer = (answer: Answer) => {
    setState(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[prev.currentQuestionIndex] = {
        ...updatedQuestions[prev.currentQuestionIndex],
        answer,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const handleAdditionalInfo = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[prev.currentQuestionIndex] = {
        ...updatedQuestions[prev.currentQuestionIndex],
        additionalInfo: e.target.value,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const handleNext = async () => {
    if (state.currentQuestionIndex === state.questions.length - 1) {
      await analyzeResponses();
    } else {
      setShowAdditionalInfo(false);
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handleBack = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleContinueQuestions = () => {
    const newQuestions = [...state.questions, ...pendingQuestions];
    setState(prev => ({
      ...prev,
      questions: newQuestions,
      currentQuestionIndex: state.questions.length,
      result: null,
    }));
    setPendingQuestions([]);
    setShowConfirmation(false);
    setShowAdditionalInfo(false);
  };

  const handleSkipMoreQuestions = () => {
    setPendingQuestions([]);
    setShowConfirmation(false);
  };

  const analyzeResponses = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          show: state.show,
          questions: state.questions.map(q => q.question),
          answers: state.questions.map(q => 
            q.additionalInfo 
              ? `${q.answer}. Additional info: ${q.additionalInfo}`
              : q.answer
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze responses');
      }

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        result: data.result,
      }));

      if (data.result.confidence < 0.9 && data.result.followUpQuestions) {
        const newQuestions = data.result.followUpQuestions.map((q: string) => ({
          question: q,
          answer: null,
        }));
        setPendingQuestions(newQuestions);
        setShowConfirmation(true);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  return (
    <div className="min-h-[100dvh] radial-gradient">
      <div className="max-w-4xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 space-y-3 xs:space-y-4 sm:space-y-6 text-orange-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4">
          <Link 
            href="/"
            className="flex items-center text-orange-50 bg-gray-800/60 hover:bg-gray-800/80 px-3 py-2 xs:py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center sm:justify-start border border-orange-900/30 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 xs:w-5 h-4 xs:h-5 mr-2" />
            Back to Search
          </Link>
          <h2 className="text-base xs:text-lg sm:text-2xl font-semibold text-center flex-1 sm:mr-8 text-orange-50 order-first sm:order-none truncate">
            {show}
          </h2>
          {rateLimitInfo && (
            <div className="text-xs xs:text-sm text-orange-200/70 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
              {rateLimitInfo.remainingUses} uses remaining today
            </div>
          )}
        </div>

        {isLoadingQuestions ? (
          <div className="flex items-center justify-center p-3 xs:p-4 sm:p-8">
            <LoadingAnimation />
          </div>
        ) : state.error ? (
          <div className="px-0 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-3 xs:p-4 sm:p-6 border-l-4 border-red-500 bg-gray-800/60 border-orange-900/30 backdrop-blur-sm">
                <p className="text-xs xs:text-sm sm:text-base text-red-400 font-medium">Error: {state.error}</p>
                <Button 
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="mt-2 xs:mt-3 sm:mt-4 text-xs xs:text-sm sm:text-base h-8 xs:h-9 sm:h-10"
                  variant="secondary"
                >
                  Try Again
                </Button>
              </Card>
            </motion.div>
          </div>
        ) : state.result ? (
          <div className="px-0 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-3 xs:p-4 sm:p-8 bg-gray-800/60 border-orange-900/30 shadow-xl backdrop-blur-sm">
                <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 xs:gap-3 sm:gap-0">
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-orange-50">Analysis Result</h3>
                    <div className="flex items-center gap-2 px-2 xs:px-3 py-1 rounded-full bg-opacity-20 self-start sm:self-auto"
                      style={{
                        backgroundColor: state.result.confidence >= 0.7 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: state.result.confidence >= 0.7 ? 'rgb(249, 115, 22)' : 'rgb(245, 158, 11)'
                      }}
                    >
                      <div className="w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full"
                        style={{
                          backgroundColor: state.result.confidence >= 0.7 ? 'rgb(249, 115, 22)' : 'rgb(245, 158, 11)'
                        }}
                      />
                      <span className="text-xs xs:text-sm font-medium">
                        {Math.round(state.result.confidence * 100)}% Confident
                      </span>
                    </div>
                  </div>

                  {state.result.lastWatchedPoint.season && state.result.lastWatchedPoint.episode && (
                    <div className="p-2 xs:p-3 sm:p-4 rounded-lg bg-orange-500/10 backdrop-blur-sm">
                      <p className="text-sm xs:text-base sm:text-lg font-medium text-orange-50">
                        Season {state.result.lastWatchedPoint.season}, 
                        Episode {state.result.lastWatchedPoint.episode}
                      </p>
                    </div>
                  )}

                  <p className="text-xs xs:text-sm sm:text-base text-orange-200/70 leading-relaxed">
                    {state.result.lastWatchedPoint.description}
                  </p>

                  <Progress 
                    value={state.result.confidence * 100} 
                    className="h-1 xs:h-1.5 sm:h-2"
                    style={{
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    }}
                  />

                  <div className="flex justify-end pt-2 xs:pt-3 sm:pt-4">
                    <Link href="/">
                      <Button variant="outline" className="h-8 xs:h-9 sm:h-10 text-xs xs:text-sm sm:text-base border-orange-900/30 text-orange-200/70 hover:bg-orange-500/10 hover:text-orange-50">
                        Try Another Show
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6 px-0 sm:px-4">
              <Progress 
                value={progress} 
                className="w-full h-1 xs:h-1.5 sm:h-2 mr-2 xs:mr-3 sm:mr-4"
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                }}
              />
              <span className="text-xs sm:text-sm font-medium text-orange-200/70 whitespace-nowrap">
                {state.currentQuestionIndex + 1} of {state.questions.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <div className="px-0 sm:px-4">
                {currentQuestion ? (
                  <motion.div
                    key={state.currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-3 xs:p-4 sm:p-8 bg-gray-800/60 border-orange-900/30 shadow-xl backdrop-blur-sm">
                      <h3 className="text-sm xs:text-base sm:text-xl font-medium mb-3 xs:mb-4 sm:mb-6 text-orange-50">
                        {currentQuestion.question}
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-6">
                        {answerButtons.map(({ value, icon, label, color }) => (
                          <Button
                            key={value}
                            onClick={() => handleAnswer(value)}
                            className={`h-9 xs:h-10 sm:h-12 py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 sm:px-6 flex items-center justify-center gap-2 xs:gap-3 text-white transition-all shadow-lg shadow-orange-900/20
                              ${currentQuestion.answer === value ? color : 'bg-gray-700/80 hover:bg-gray-700'}`}
                          >
                            {icon}
                            <span className="text-xs xs:text-sm sm:text-base">{label}</span>
                          </Button>
                        ))}
                      </div>

                      {currentQuestion.answer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex items-center gap-2 mb-2 xs:mb-3 sm:mb-4">
                            <Button
                              variant="ghost"
                              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                              className="text-xs xs:text-sm text-orange-200/70 hover:text-black w-full sm:w-auto py-1.5 xs:py-2 h-auto"
                            >
                              {showAdditionalInfo ? 'Hide additional details' : 'Add additional details'}
                            </Button>
                          </div>

                          {showAdditionalInfo && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <Textarea
                                placeholder="Add any additional details that might help (optional)"
                                value={currentQuestion.additionalInfo || ''}
                                onChange={handleAdditionalInfo}
                                className="mb-3 xs:mb-4 bg-gray-800/80 border-orange-900/30 text-orange-50 placeholder-orange-200/30 text-xs xs:text-sm sm:text-base focus:border-orange-500/50 focus:ring-orange-500/30 backdrop-blur-sm"
                                rows={3}
                              />
                            </motion.div>
                          )}

                          <div className="flex flex-col sm:flex-row justify-between gap-2 xs:gap-3 sm:gap-4">
                            {state.currentQuestionIndex > 0 && (
                              <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex items-center gap-2 border-orange-900/30 text-orange-200/70 hover:bg-orange-500/10 hover:text-orange-50 w-full sm:w-auto justify-center text-xs xs:text-sm sm:text-base py-2 xs:py-2.5 h-8 xs:h-9 sm:h-10"
                              >
                                <ArrowLeft className="w-3 xs:w-4 h-3 xs:h-4" />
                                Previous
                              </Button>
                            )}
                            <Button
                              onClick={handleNext}
                              disabled={state.isAnalyzing}
                              className={`${state.currentQuestionIndex === 0 ? 'w-full' : ''} 
                                bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-900/20
                                text-white py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 sm:px-6 text-xs xs:text-sm sm:text-base h-8 xs:h-9 sm:h-10`}
                            >
                              {state.isAnalyzing ? (
                                <>
                                  <Loader2 className="mr-2 h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5 animate-spin" />
                                  Analyzing...
                                </>
                              ) : state.currentQuestionIndex === state.questions.length - 1 ? (
                                <>
                                  <Send className="mr-2 h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5" />
                                  Analyze Responses
                                </>
                              ) : (
                                <>
                                  Next Question
                                  <ChevronRight className="ml-2 h-3 xs:h-4 sm:h-5 w-3 xs:w-4 sm:w-5" />
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <LoadingAnimation />
                  </div>
                )}
              </div>
            </AnimatePresence>
          </>
        )}

        {state.isAnalyzing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <LoadingAnimation />
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="max-w-lg w-full p-4 xs:p-6 sm:p-8 bg-gray-800/90 border-orange-900/30 shadow-xl backdrop-blur-sm">
                <div className="space-y-4 xs:space-y-6">
                  <div className="flex items-center gap-2 text-orange-500">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <h3 className="text-base xs:text-lg sm:text-xl font-semibold">Improve Accuracy</h3>
                  </div>
                  
                  <p className="text-sm xs:text-base text-orange-200/70">
                    Our confidence level is {Math.round(state.result!.confidence * 100)}%. Would you like to answer a few more questions to improve the accuracy of our analysis?
                  </p>

                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 pt-2">
                    <Button
                      onClick={handleContinueQuestions}
                      className="w-full xs:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                    >
                      Yes, Continue
                    </Button>
                    <Button
                      onClick={handleSkipMoreQuestions}
                      variant="outline"
                      className="w-full xs:w-auto border-orange-900/30 text-orange-200/70 hover:bg-orange-500/10 hover:text-orange-50"
                    >
                      No, Keep Current Result
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}; 