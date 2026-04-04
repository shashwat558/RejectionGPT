"use client";



export default function FeaturesBentoGrid() {
  // const [enabled, setEnabled] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-4">
            Everything you need to <span className="text-gray-400">ace the interview</span>
          </h2>
        </div>
      </div>

      <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        
        {/* Deep Analysis Card */}
        <div className="col-span-1 md:col-span-1 bg-white border-2 border-black rounded-3xl p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all duration-300 group">
          <div>
            <h3 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black block"></span>
              Deep Analysis
            </h3>
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Get an instant score on how well your resume matches the job description, built by reverse-engineering ATS systems.
            </p>
          </div>
          <div className="w-full h-32 mt-6 rounded-xl bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:scale-[1.02] transition-transform">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm border-2 border-black flex items-center justify-center">
              <div className="text-2xl font-bold text-black">94<span className="text-sm font-normal text-gray-500">%</span></div>
            </div>
          </div>
        </div>

        {/* AI Mock Interview Card */}
        <div className="col-span-1 md:col-span-2 bg-white border-2 border-black rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all duration-300">
          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold text-black mb-4">
              AI Powered
            </div>
            <h3 className="text-3xl font-bold text-black mb-3 leading-tight tracking-tight">
              A personal interview coach in your pocket
            </h3>
            <p className="text-gray-600 font-medium text-base mb-8">
              Say goodbye to generic advice. Our AI reads your resume and the job description to mock-interview you like a real hiring manager.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:flex items-end justify-end pointer-events-none p-6">
            <div className="w-full h-4/5 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-8 translate-x-8 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500 p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-black flex-shrink-0"></div>
                <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-sm p-3 text-sm font-medium text-black">Tell me about a time you handled a difficult client.</div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-black text-white rounded-2xl rounded-tr-sm p-3 text-sm font-medium border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">In my previous role, I mediated...</div>
              </div>
            </div>
          </div>
        </div>

        {/* DSA Practice Card */}
        <div className="col-span-1 md:col-span-2 bg-white border-2 border-black rounded-3xl p-8 flex items-center gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] transition-all duration-300 overflow-hidden group">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black mb-2 flex items-center gap-2">
              Tailored DSA Practice
            </h3>
            <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">
              Stop grinding random LeetCode questions. We recommend specific problems based on your target company and role.
            </p>
            <button className="text-sm font-bold text-black underline underline-offset-4 hover:opacity-70 transition-opacity">Explore problems</button>
          </div>
          <div className="hidden sm:flex flex-1 justify-end">
            <div className="w-48 h-48 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50 flex items-center justify-center p-4 relative group-hover:rotate-12 transition-transform duration-700">
              <div className="w-full h-full border border-dashed border-gray-300 rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <div className="w-3/4 h-3/4 bg-white rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner inside Grid */}
        <div className="col-span-1 md:col-span-1 bg-black rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Ready to start?</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Join thousands of professionals landing their dream roles faster.
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-white text-sm font-medium">Create account</div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
