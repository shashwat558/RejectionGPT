"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Eye, Download } from "lucide-react"
import { AnswerType, QuestionType } from "@/app/interview/[id]/InterviewClient"
import { createClient } from "@/lib/utils/supabase/client"

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

  const exportAsCSV = () => {
  const rows = [
    ["Question", "Answer", "Time Spent (s)", "Feedback", "Score"]
  ]

  questions.forEach((q) => {
    const answer = answers.find((a) => a.questionId === q.id)
    const feedback = feedbacks.find((f) => f.question_id === q.id)

    rows.push([
      `"${q.question_text}"`,
      `"${answer?.answerText ?? "No answer"}"`,
      `${answer?.timeSpent ?? 0}`,
      `"${feedback?.feedback_text ?? "No feedback"}"`,
      `${feedback?.score ?? ""}`
    ])
  })

  const csvContent = rows.map((r) => r.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `interview-results-${interviewId}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="py-8 space-y-6">
      <div className="bg-[#252525] rounded-xl border border-[#383838] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-200 mb-2">Interview Complete!</h1>
        <p className="text-gray-400">Here&apos;s how you performed in your practice session</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#252525] border border-[#383838] rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-200 mb-1">{answeredQuestions}</div>
          <div className="text-gray-500 text-sm">Questions Answered</div>
          <div className="text-gray-400 text-xs mt-1">out of {questions.length}</div>
        </div>

        <div className="bg-[#252525] border border-[#383838] rounded-lg p-6 text-center">
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(completionRate)}`}>
            {Math.round(completionRate)}%
          </div>
          <div className="text-gray-500 text-sm">Completion Rate</div>
        </div>

        <div className="bg-[#252525] border border-[#383838] rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-200 mb-1">
            {formatTime(Math.round(averageTime))}
          </div>
          <div className="text-gray-500 text-sm">Avg. Time per Question</div>
        </div>

        <div className="bg-[#252525] border border-[#383838] rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-200 mb-1">{formatTime(totalTime)}</div>
          <div className="text-gray-500 text-sm">Total Time</div>
        </div>
      </div>

     
      <div className="bg-[#252525] rounded-xl border border-[#383838] p-6">
        <div className="space-y-3">
          {questions.map((question, index) => {
            const answer = answers.find((a) => a.questionId === question.id)
            const feedback = feedbacks.find((f) => f.question_id === question.id)
            const hasAnswer = answer && answer.answerText.trim().length > 0

            return (
              <div
                key={question.id}
                className="border border-[#383838] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        hasAnswer
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {hasAnswer ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-300 font-medium">Question {index + 1}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 break-words">
                        {question.question_text}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {answer ? formatTime(answer.timeSpent) : "0:00"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedAnswer(selectedAnswer === index ? null : index)
                    }
                    className="ml-4 p-2 rounded-md bg-[#333] hover:bg-[#444] text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {selectedAnswer === index && (
                  <div className="mt-4 pt-4 border-t border-[#383838] space-y-6">
                    <div>
                      <h4 className="text-gray-300 font-medium mb-2">Your Answer:</h4>
                      {hasAnswer ? (
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <p className="text-gray-300 whitespace-pre-wrap">{answer!.answerText}</p>
                          <div className="flex justify-between text-sm text-gray-500 mt-3">
                            <span>{answer!.answerText.length} characters</span>
                            <span>
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
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <p className="text-red-400 text-sm">No answer provided</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-gray-300 font-medium mb-2">Feedback:</h4>
                      {feedback ? (
                        <div className="bg-[#1f1f1f] border border-[#383838] rounded-lg p-4">
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {feedback.feedback_text}
                          </p>
                          <div className="text-sm mt-2 text-gray-400">
                            Score:{" "}
                            <span className={`${getScoreColor(feedback.score)} font-semibold`}>
                              {feedback.score}/100
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <p className="text-yellow-400 text-sm">No feedback available</p>
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
      <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg transition-colors"  onClick={exportAsCSV}>
          <Download className="w-4 h-4" />
          Export Results
        </button>
      </div>
    </div>
  )
}
