'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
}

interface Quiz {
  questions: Question[];
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a valid PDF file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      setQuiz(data);
      setShowAnswers(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setQuiz(null);
    setError(null);
    setShowAnswers(false);
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!submitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: optionIndex
      }));
    }
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
    setShowAnswers(true);
  };

  const calculateScore = () => {
    if (!quiz) return { correct: 0, total: 0 };
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: quiz.questions.length };
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with user info */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  PDF Quiz Generator
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-indigo-500"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {!quiz && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome back, {user.displayName?.split(' ')[0] || 'there'}! 👋
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Upload a PDF to generate quiz questions instantly
              </p>
            </div>
          )}

          {/* Upload Form */}
          {!quiz && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="pdf-upload"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Choose PDF File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="pdf-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="pdf-upload"
                            name="pdf-upload"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF up to 10MB
                      </p>
                    </div>
                  </div>
                  {file && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ Selected: {file.name}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm text-red-800 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Quiz...
                    </>
                  ) : (
                    'Generate Quiz'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quiz Display */}
          {quiz && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Generated Quiz
                  </h2>
                  {submitted && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Score: {calculateScore().correct} / {calculateScore().total} ({Math.round((calculateScore().correct / calculateScore().total) * 100)}%)
                    </p>
                  )}
                </div>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Upload New PDF
                </button>
              </div>

              <div className="mb-6 flex gap-3">
                {!submitted && (
                  <button
                    onClick={handleSubmitAnswers}
                    disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answers
                  </button>
                )}
                {submitted && (
                  <button
                    onClick={() => {
                      setShowAnswers(!showAnswers);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                  >
                    {showAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {quiz.questions.map((q, qIndex) => {
                  const isAnswered = selectedAnswers.hasOwnProperty(qIndex);
                  const selectedAnswer = selectedAnswers[qIndex];
                  const isCorrect = selectedAnswer === q.correct_answer;
                  
                  return (
                    <div
                      key={qIndex}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {qIndex + 1}. {q.question}
                      </h3>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => {
                          const isSelected = selectedAnswer === oIndex;
                          const isCorrectAnswer = oIndex === q.correct_answer;
                          
                          let optionClass = 'p-3 rounded-md border cursor-pointer transition-all ';
                          
                          if (submitted) {
                            // After submission
                            if (isCorrectAnswer && showAnswers) {
                              optionClass += 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600';
                            } else if (isSelected && !isCorrect) {
                              optionClass += 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600';
                            } else {
                              optionClass += 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
                            }
                          } else {
                            // Before submission
                            if (isSelected) {
                              optionClass += 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600';
                            } else {
                              optionClass += 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-400';
                            }
                          }
                          
                          return (
                            <div
                              key={oIndex}
                              onClick={() => handleAnswerSelect(qIndex, oIndex)}
                              className={optionClass}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {String.fromCharCode(65 + oIndex)}.
                                  </span>
                                  <span className="text-gray-900 dark:text-white">
                                    {option}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!submitted && isSelected && (
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                      Selected
                                    </span>
                                  )}
                                  {submitted && isSelected && isCorrect && (
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                      ✓ Correct
                                    </span>
                                  )}
                                  {submitted && isSelected && !isCorrect && (
                                    <span className="text-red-600 dark:text-red-400 font-semibold">
                                      ✗ Wrong
                                    </span>
                                  )}
                                  {submitted && showAnswers && isCorrectAnswer && !isSelected && (
                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                      ✓ Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
