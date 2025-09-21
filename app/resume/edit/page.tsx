// "use client"
// import React, { useState } from 'react'
// import { motion } from "framer-motion";
// import { generateResumePDF } from '@/lib/utils';

// const Page = () => {
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);

//   const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && file.type === "application/pdf") {
      

//       const formData = new FormData();

//       formData.append("file", file);

//       const res = await fetch("/api/parse-pdf", {
//         method: "POST",
//         body: formData
//       })

//       if(res.ok){
//         const {json} = await res.json();
//         const pdfBytes = await generateResumePDF(json);
//         const uint8Array = new Uint8Array(pdfBytes as unknown as ArrayBuffer);
//         const blob = new Blob([uint8Array.buffer], {type: "application/pdf"});
//         const url = URL.createObjectURL(blob)
//         setPdfUrl(url)
//         console.log(json)
//       }
      


//     } else {
//       alert("Please upload a valid PDF file.");
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 1.05 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.5 }}
//       className='w-full flex flex-col justify-center items-center mt-10 p-2'
//     >
//       <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#303030]/20 to-transparent pointer-events-none" />

//       <div className='xl:w-[85%] w-full flex justify-center items-center rounded-lg border-t-3 border-[#383838] bg-[#252525] shadow-xl relative z-10 p-4'>

       
//         <div className={`w-1/2 h-[85vh] p-4 m-5 flex flex-col items-center justify-center transition-all duration-300 ${
//           !pdfUrl ? "border-4 border-dashed border-gray-500 rounded-2xl " : ""
//         }`}>
//           {pdfUrl ? (
//             <>
//               <div className='w-full text-right mb-2'>
//                 <button
//                   className='text-sm text-gray-300 underline hover:text-red-400 transition'
//                   onClick={() => setPdfUrl(null)}
//                 >
//                   Remove PDF
//                 </button>
//               </div>
//               <iframe
//                 src={pdfUrl}
//                 width="100%"
//                 height="100%"
//                 className='border rounded-lg shadow-lg'
//               />
//             </>
//           ) : (
//             <div className='flex flex-col items-center justify-center text-center gap-4'>
//               <label className="px-4 py-2 border border-gray-600 rounded-md text-sm text-gray-200 bg-[#1e1e1e] cursor-pointer hover:bg-[#333] transition">
//                 Upload PDF
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={handleFileChange}
//                   className="hidden"
//                 />
//               </label>
//               <p className='text-gray-400 text-sm'>Upload your resume PDF to view it here.</p>
//             </div>
//           )}
//         </div>

        
//         <div className='w-[1px] bg-gray-500 h-[80vh]'></div>

        
//         <div className='w-1/2'></div>

//       </div>
//     </motion.div>
//   );
// }

// export default Page;



import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page