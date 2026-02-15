import React from 'react'
import RoadMapFlow from '@/components/RoadMapFlow'
import { createClientServer } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;
  const supabase = await createClientServer();
  const {data: analysisData, error: analysisError} = await supabase.from("analysis_result").select("roadmap").eq("id", id).single();
  if(analysisError || !analysisData || !analysisData.roadmap){
    redirect(`${process.env.SITE_URL}/analytics`);
  }

  const roadmapData = analysisData.roadmap;

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/analytics/${id}`} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>
          
          

          <h1 className="text-3xl md:text-4xl font-bold text-gray-200 mb-2">
            {roadmapData.title || "Your Learning Roadmap"}
          </h1>
          {roadmapData.description && (
            <p className="text-gray-400 text-sm md:text-base max-w-3xl">
              {roadmapData.description}
            </p>
          )}
        </div>

        {/* Roadmap Flow */}
        <RoadMapFlow roadmapData={roadmapData} roadmapId={id} />
      </div>
    </div>
  )
}

export default page