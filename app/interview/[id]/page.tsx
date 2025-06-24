import React from 'react'
import InterviewClient from './InterviewClient';
import { getInterviewQuestions } from '@/lib/actions/actions';

const page = async ({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
    console.log(id);
    const interviewQUestions = await getInterviewQuestions(id)
    const questions = interviewQUestions.map((question) => ({
        id: question.id,
        index: question.order,
        question_text: question.question_text
    }))
    console.log(questions)
  return (
    
        <InterviewClient interviewId={id} questions={questions}/>
        
    
  )
}

export default page