"use client"
import { createClient } from '@/lib/utils/supabase/client';
import React, { useState } from 'react'

interface QuestionType {
    id: string
    index: number,
    question_text: string
}

interface AnswerType {
    questionId: string,
    answerText: string,
    timeSpent: string
}


const InterviewClient = ({interviewId, questions}: {interviewId: string, questions: QuestionType[]}) => {
    
    const [currentState, setCurrentState] = useState<"start"| "interview" | "result">("start");

    const [currentQuestionIndex , setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerType[]| []>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const supabase = createClient()

    const handleStart = async () => {
        const {data: startTime, error} = await supabase.from("interview").update({
            started_at: new Date()
        }).eq('id', interviewId).select('started_at').maybeSingle();
        if(error || !startTime){
            throw new Error(error?.message);
        }
        setStartTime(startTime.started_at);
        setCurrentQuestionIndex(0);
        setAnswers([]);



    }
  return (
    <div className=' text-white text-4xl' 
    >{interviewId}</div>
  )
}

export default InterviewClient