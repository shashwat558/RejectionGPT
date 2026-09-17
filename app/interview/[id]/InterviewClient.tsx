"use client"
import InterviewQuestions from '@/components/InterviewQuestions';
import InterviewResults from '@/components/InterviewResult';
import InterviewStart from '@/components/InterviewStart';
import { saveInterviewAnswers, startInterviewSession, submitInterviewResponses } from '@/lib/services/interview.client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export interface QuestionType {
    id: string
    index: number,
    question_text: string
}

export interface AnswerType {
    questionId: string,
    answerText: string,
    timeSpent: number
}


const InterviewClient = ({interviewId, questions, isCompleted}: {interviewId: string, questions: QuestionType[], isCompleted: string}) => {

    const [currentState, setCurrentState] = useState<"start"| "interview" | "result">("start");

    const [currentQuestionIndex , setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      if (isCompleted === "completed") {
        router.push(`/interview/result/${interviewId}`)
      }
    }, [isCompleted, interviewId, router]);


    const handleStart = async () => {
        setError(null);
        try {
          await startInterviewSession(interviewId);
          setCurrentState("interview");
          setCurrentQuestionIndex(0);
          setAnswers([]);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to start");
        }
    }
    
    const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
  const newAnswer: AnswerType = {
    questionId: questions[currentQuestionIndex].id,
    answerText: answer,
    timeSpent,
  };

  const allAnswers = [...answers, newAnswer];

  setAnswers(allAnswers);

  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex((prev) => prev + 1);
  } else {
    setIsSubmitting(true);
    setError(null);
    try {
      // Persist answers server-side (RLS + ownership enforced)
      await saveInterviewAnswers(interviewId, allAnswers);
      // Score via evaluator agent
      await submitInterviewResponses(
        questions.map((q, i) => ({
          question_id: q.id,
          question_text: q.question_text,
          answer: allAnswers[i]?.answerText ?? "",
        })),
        interviewId
      );

      setCurrentState("result");
      router.push(`/interview/result/${interviewId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }
};


    

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
        {currentState === "start" && <InterviewStart onStart={handleStart} />}

        {currentState === "interview" && (
          <InterviewQuestions
            interviewId={interviewId}
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswerSubmit={handleAnswerSubmit}

          />
        )}
        {currentState === "result" && (
          <InterviewResults
            interviewId={interviewId}

            
            
          />
        )}

        {isSubmitting && <p className="mt-4 text-sm text-gray-500">Submitting…</p>}
      </div>
    </div>  
  )
}

export default InterviewClient
