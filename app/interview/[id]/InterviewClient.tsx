"use client"
import InterviewQuestions from '@/components/InterviewQuestions';
import InterviewResults from '@/components/InterviewResult';
import InterviewStart from '@/components/InterviewStart';
import { createClient } from '@/lib/utils/supabase/client';
import { UUID } from 'crypto';
import React, { useState } from 'react'

export interface QuestionType {
    id: UUID
    index: number,
    question_text: string
}

export interface AnswerType {
    questionId: string,
    answerText: string,
    timeSpent: number
}


const InterviewClient = ({interviewId, questions}: {interviewId: string, questions: QuestionType[]}) => {
    
    const [currentState, setCurrentState] = useState<"start"| "interview" | "result">("start");

    const [currentQuestionIndex , setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerType[]| []>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    
    const supabase = createClient();

    const handleStart = async () => {

        const {data: startTime, error} = await supabase.from("interview").update({
            started_at: new Date()
        }).eq('id', interviewId).select('started_at').maybeSingle();
        if(error || !startTime){
            throw new Error(error?.message);
        }
        setCurrentState("interview");
        setStartTime(startTime.started_at);
        setCurrentQuestionIndex(0);
        setAnswers([]);



    }
    
    const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
  const newAnswer: AnswerType = {
    questionId: questions[currentQuestionIndex].id,
    answerText: answer,
    timeSpent,
  };

  const allAnswers = [...answers, newAnswer]; // answers + new one

  setAnswers(allAnswers);

  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex((prev) => prev + 1);
  } else {
    await Promise.all([
      Promise.all(
        allAnswers.map((answer) =>
          supabase.from("interview_answers").insert({
            interview_id: interviewId,
            question_id: answer.questionId,
            answer_text: answer.answerText,
            time_spent: answer.timeSpent,
          })
        )
      ),
      supabase.from("interview")
        .update({ ended_at: new Date() })
        .eq("id", interviewId),
      fetch("/api/interview/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          responses: questions.map((q, i) => ({
            question_id: q.id,
            question_text: q.question_text,
            answer: allAnswers[i]?.answerText ?? "",
          })),
        }),
      }),
    ]);

    setCurrentState("result");
  }
};


    

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {currentState === "start" && <InterviewStart onStart={handleStart} />}

        {currentState === "interview" && (
          <InterviewQuestions
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

        
      </div>
    </div>  
  )
}

export default InterviewClient