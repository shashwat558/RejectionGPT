import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PDFDocument, StandardFonts } from 'pdf-lib';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export async function generateResumePDF(data: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); 

  console.log(data + "     i got the data")

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  let y = 800;

  const draw = (text: string) => {
    page.drawText(text, { x: 50, y, size: fontSize, font });
    y -= 20;
  };

  draw(`Name: ${data.personal_information.name}`);
  draw(`Email: ${data.personal_information.email}`);
  draw(`Phone: ${data.personal_information.phone}`);
  draw(`LinkedIn: ${data.personal_information.linkedin}`);
  draw(`GitHub: ${data.personal_information.github}`);
  draw(`Portfolio: ${data.personal_information.portfolio}`);
  draw(`\nSummary:\n${data.profile_summary}`);

  draw(`\nExperience:`);
  data.experience.forEach((exp: any) => {
    draw(`- ${exp.title} at ${exp.company} (${exp.dates})`);
    draw(`  ${exp.description}`);
  });

  draw(`\nProjects:`);
  data.projects.forEach((project: any) => {
    draw(`- ${project.name} (${project.dates})`);
    draw(`  Tools: ${project.tools.join(", ")}`);
    draw(`  ${project.description}`);
  });

  draw(`\nSkills:`);
  Object.entries(data.technical_skills).forEach(([cat, items]) => {
    draw(`${cat}: ${(items as string[]).join(", ")}`);
  });

  draw(`\nEducation:`);
  draw(`${data.education.degree} - ${data.education.institution}`);
  draw(`CGPA: ${data.education.cgpa}`);
  draw(`Graduation: ${data.education.graduation_date}`);

  draw(`\nAchievements:`);
  data.achievements.forEach((ach: string) => draw(`- ${ach}`));

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
