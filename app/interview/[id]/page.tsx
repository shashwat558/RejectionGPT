import React from 'react'
import InterviewClient from './InterviewClient';
import { getInterviewQuestions } from '@/lib/actions/actions';

const page = async ({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
    console.log(id);
    const interviewQUestions = await getInterviewQuestions(id)
    const questions = interviewQUestions.map((question) => ({
        id: question.order,
        question_text: question.question_text
    }))
    console.log(questions)
  return (
    <div className='w-screen h-screen flex justify-center items-center'>
        <InterviewClient interviewId={id} questions={questions}/>
        
    </div>
  )
}

export default page