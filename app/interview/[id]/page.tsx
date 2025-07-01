import React from 'react'
import InterviewClient from './InterviewClient';
import { getInterviewQuestions } from '@/lib/actions/actions';

import { createClientServer } from '@/lib/utils/supabase/server';

const page = async ({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
    console.log(id);

    const supabase = await createClientServer();

    const {data, error} = await supabase.from("interview").select("status").eq("id", id).single();
    if(error || !data){
      throw new Error(error.message);
    }
    
    const interviewQUestions = await getInterviewQuestions(id)
    const questions = interviewQUestions.map((question) => ({
        id: question.id,
        index: question.order,
        question_text: question.question_text
    }))
    console.log(questions)
  return (
    
        <InterviewClient interviewId={id} questions={questions} isCompleted={data.status}/>
        
    
  )
}

export default page