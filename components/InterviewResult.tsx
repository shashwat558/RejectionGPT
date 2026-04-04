  "use client"

  import { useEffect, useState } from "react"
  import { CheckCircle, XCircle, Eye, Download, Share } from "lucide-react"
  import { AnswerType, QuestionType } from "@/app/interview/[id]/InterviewClient"
  import { createClient } from "@/lib/utils/supabase/client"
  import jsPDF from "jspdf";


  interface InterviewResultsProps {
    interviewId: string
  }




  export default function InterviewResults({ interviewId }: InterviewResultsProps) {
    const supabase = createClient()



    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [answers, setAnswers] = useState<AnswerType[]>([])
    const [feedbacks, setFeedbacks] = useState<
      { question_id: string; feedback_text: string; score: number }[]
    >([])

 
const exportAsPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15; // vertical position

  // Header
  doc.setFontSize(18);
  doc.text(`Interview Results - ${interviewId}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  // Summary box
  const summaryLines = [
    `Questions Answered: ${answeredQuestions}/${questions.length}`,
    `Completion Rate: ${Math.round(completionRate)}%`,
    `Total Time: ${formatTime(totalTime)}`,
    `Average Time per Question: ${formatTime(Math.round(averageTime))}`
  ];

  summaryLines.forEach(line => {
    doc.text(line, 14, y);
    y += 6;
  });

  y += 4; // spacing before questions

  // Draw questions and answers
  questions.forEach((q, idx) => {
    if (y > 270) { // simple page break
      doc.addPage();
      y = 15;
    }

    const answer = answers.find(a => a.questionId === q.id);
    const feedback = feedbacks.find(f => f.question_id === q.id);
    const hasAnswer = answer && answer.answerText.trim().length > 0;

    // Question
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 0); // greenish
    doc.text(`Q${idx + 1}: ${q.question_text}`, 14, y);
    y += 6;

    // Answer
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Answer: ${hasAnswer ? answer!.answerText : "No answer provided"}`, 16, y);
    y += 6;

    // Feedback
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 255); // blueish
    doc.text(
      `Feedback: ${feedback ? feedback.feedback_text + ` (Score: ${feedback.score}/100)` : "No feedback"}`,
      16,
      y
    );
    y += 10;
  });

  doc.save(`interview-results-${interviewId}.pdf`);
};


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }


    useEffect(() => {
      const fetchData = async () => {
        const [questionsRes, answersRes, feedbacksRes] = await Promise.all([
          supabase
            .from("interview_questions")
            .select("id, order, question_text")
            .eq("interview_id", interviewId),
          supabase
            .from("interview_answers")
            .select("question_id, answer_text, time_spent")
            .eq("interview_id", interviewId),
          supabase
            .from("interview_feedback")
            .select("question_id, feedback_text, score")
            .eq("interview_id", interviewId)
        ])

        if (questionsRes.error || answersRes.error || feedbacksRes.error) {
          const error =
            questionsRes.error || answersRes.error || feedbacksRes.error
          throw new Error(error?.message)
        }

        setQuestions(
          questionsRes.data.map((q) => ({
            id: q.id,
            index: q.order,
            question_text: q.question_text
          }))
        )

        setAnswers(
          answersRes.data.map((a) => ({
            questionId: a.question_id,
            answerText: a.answer_text,
            timeSpent: a.time_spent
          }))
        )

        setFeedbacks(feedbacksRes.data)
      }

      fetchData()
    }, [interviewId, supabase])

    const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0)
    const answeredQuestions = answers.filter((a) => a.answerText.trim().length > 0).length
    const averageTime = totalTime / (answers.length || 1)
    const completionRate = (answeredQuestions / (questions.length || 1)) * 100

    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-600 font-semibold"
      if (score >= 60) return "text-yellow-600 font-semibold"
      return "text-red-500 font-semibold"
    }

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
      <div className="py-8 space-y-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Interview Complete!</h1>
          <p className="text-gray-500">Here&apos;s how you performed in your practice session</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-black mb-1">{answeredQuestions}</div>
            <div className="text-gray-500 text-sm font-medium">Questions Answered</div>
            <div className="text-gray-400 text-xs mt-1">out of {questions.length}</div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center">
            <div className={`text-3xl mb-1 ${getScoreColor(completionRate)}`}>
              {Math.round(completionRate)}%
            </div>
            <div className="text-gray-500 text-sm font-medium">Completion Rate</div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-black mb-1">
              {formatTime(Math.round(averageTime))}
            </div>
            <div className="text-gray-500 text-sm font-medium">Avg. Time per Question</div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-black mb-1">{formatTime(totalTime)}</div>
            <div className="text-gray-500 text-sm font-medium">Total Time</div>
          </div>
        </div>

      
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            {questions.map((question, index) => {
              const answer = answers.find((a) => a.questionId === question.id)
              const feedback = feedbacks.find((f) => f.question_id === question.id)
              const hasAnswer = answer && answer.answerText.trim().length > 0

              return (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${
                          hasAnswer
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {hasAnswer ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-black font-semibold">Question {index + 1}</h3>
                        <p className="text-gray-600 mt-1 line-clamp-2 break-words">
                          {question.question_text}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-gray-500 text-sm font-medium bg-gray-50 px-2 py-1 rounded">
                          {answer ? formatTime(answer.timeSpent) : "0:00"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedAnswer(selectedAnswer === index ? null : index)
                      }
                      className="ml-4 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black transition-colors shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedAnswer === index && (
                    <div className="mt-5 pt-5 border-t border-gray-100 space-y-6">
                      <div>
                        <h4 className="text-black font-semibold mb-3">Your Answer:</h4>
                        {hasAnswer ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <p className="text-black leading-relaxed whitespace-pre-wrap">{answer!.answerText}</p>
                            <div className="flex justify-between text-xs text-gray-500 mt-4 capitalize">
                              <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{answer!.answerText.length} characters</span>
                              <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                {
                                  answer!.answerText
                                    .split(" ")
                                    .filter((word) => word.length > 0).length
                                }{" "}
                                words
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-red-500 font-medium text-sm">No answer provided</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-black font-semibold mb-3">Feedback from Coach:</h4>
                        {feedback ? (
                          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <p className="text-black leading-relaxed whitespace-pre-wrap">
                              {feedback.feedback_text}
                            </p>
                            <div className="text-sm mt-4 pb-2 border-b border-gray-100 max-w-[200px] flex justify-between">
                              <span className="text-gray-500">Score:</span>
                              <span className={`${getScoreColor(feedback.score)}`}>
                                {feedback.score}/100
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-500 font-medium text-sm">No feedback available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-black font-medium rounded-xl transition-colors"  onClick={exportAsPDF}>
            <Download className="w-4 h-4" />
            Export Results
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"  onClick={handleShare}>
            <Share className="w-4 h-4" />
            Share Results
          </button>
        </div>
      </div>
    )
  }
