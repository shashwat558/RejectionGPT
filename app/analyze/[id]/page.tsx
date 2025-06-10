import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {
    const params = useParams();
    const analysisId = params.id;


  return (
    <div>{analysisId}</div>
  )
}

export default Page;