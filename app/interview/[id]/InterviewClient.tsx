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
        const newAnswer:AnswerType = {
            questionId: questions[currentQuestionIndex].id,
            answerText: answer,
            timeSpent: timeSpent

        }
        setAnswers((prev) => [...prev, newAnswer]);

        if(currentQuestionIndex < (questions.length -1)){
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setCurrentState("result")
        }

    }

    

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
            questions={questions}
            answers={answers}
            startTime={startTime}
            
            
          />
        )}

        
      </div>
    </div>  
  )
}

export default InterviewClient