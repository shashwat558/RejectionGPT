"use client"
import FeaturesBentoGrid from "@/components/FeaturesBentoGrid";
import ResumeUploaderHome from "@/components/ResumeUploaderHome";

export default function Home() {
  return (
    <div className="pt-24 sm:pt-32 pb-16">
      <ResumeUploaderHome />
      <FeaturesBentoGrid />
    </div>
  );
}
