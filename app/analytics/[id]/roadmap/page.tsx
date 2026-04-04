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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/analytics/${id}`} 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors mb-6 bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>

          <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-3">
            {roadmapData.title || "Your Learning Roadmap"}
          </h1>
          {roadmapData.description && (
            <p className="text-gray-500 text-sm md:text-lg font-medium max-w-3xl leading-relaxed">
              {roadmapData.description}
            </p>
          )}
        </div>

        {/* Roadmap Flow */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex">
           <RoadMapFlow roadmapData={roadmapData} roadmapId={id} />
        </div>
      </div>
    </div>
  )
}

export default page