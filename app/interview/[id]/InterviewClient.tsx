"use client"
import InterviewQuestions from '@/components/InterviewQuestions';
import InterviewResults from '@/components/InterviewResult';
import InterviewStart from '@/components/InterviewStart';
import TypingIndicator from '@/components/typingIndicator';
import { requestInterviewFollowup, saveInterviewAnswers, startInterviewSession, submitInterviewResponses } from '@/lib/services/interview.client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'

export interface QuestionType {
    id: string
    index: number,
    question_text: string
}

export interface AnswerType {
    /** Client-generated UUID for follow-up linkage. Absent on rows read back from the DB. */
    clientId?: string,
    questionId: string,
    answerText: string,
    timeSpent: number,
    /** Parent answer clientId — set only on follow-up turns. */
    followupOf?: string | null,
    /** Interviewer's follow-up question text — set only on follow-up turns. */
    promptText?: string | null,
}

const MAX_FOLLOWUPS = 2;
const FOLLOWUP_TIME_LIMIT = 60;

/** Synthetic question object for a follow-up turn (autoplays TTS via id change). */
function followupQuestion(parent: QuestionType, n: number, text: string): QuestionType {
  return { id: `${parent.id}#f${n}`, index: parent.index, question_text: text };
}

function newClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const InterviewClient = ({interviewId, questions, isCompleted}: {interviewId: string, questions: QuestionType[], isCompleted: string}) => {

    const [currentState, setCurrentState] = useState<"start"| "interview" | "result">("start");

    const [currentQuestionIndex , setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Follow-up state for the current question
    const [followupPrompt, setFollowupPrompt] = useState<string | null>(null);
    const [followupCount, setFollowupCount] = useState(0);
    const router = useRouter();

    // Accumulated answers (mains + follow-up turns); submitted as one batch at the end.
    const collectedRef = useRef<AnswerType[]>([]);
    const parentClientIdRef = useRef<string | null>(null);

    useEffect(() => {
      if (isCompleted === "completed") {
        router.push(`/interview/result/${interviewId}`)
      }
    }, [isCompleted, interviewId, router]);


    const handleStart = async () => {
        setError(null);
        try {
          await startInterviewSession(interviewId);
          collectedRef.current = [];
          parentClientIdRef.current = null;
          setFollowupPrompt(null);
          setFollowupCount(0);
          setCurrentState("interview");
          setCurrentQuestionIndex(0);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to start");
        }
    }

    const resetTurn = () => {
      setFollowupPrompt(null);
      setFollowupCount(0);
      parentClientIdRef.current = null;
    };

    const advanceOrFinish = async () => {
      resetTurn();
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await finishInterview();
      }
    };

    const finishInterview = async () => {
      setIsSubmitting(true);
      setError(null);
      try {
        const all = collectedRef.current;
        await saveInterviewAnswers(interviewId, all);
        // Evaluation covers main answers only (follow-ups are practice turns).
        const mains = all.filter((a) => !a.followupOf);
        await submitInterviewResponses(
          mains.map((a) => {
            const q = questions.find((qq) => qq.id === a.questionId);
            return {
              question_id: a.questionId,
              question_text: q?.question_text ?? "",
              answer: a.answerText,
            };
          }),
          interviewId
        );

        setCurrentState("result");
        router.push(`/interview/result/${interviewId}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submission failed");
      } finally {
        setIsSubmitting(false);
      }
    };

    /** Ask the agent whether to probe deeper after an answer. Degrades to advance on any failure. */
    const maybeFollowup = async (question: QuestionType, answerText: string, askedSoFar: number) => {
      if (!answerText.trim() || askedSoFar >= MAX_FOLLOWUPS) {
        await advanceOrFinish();
        return;
      }
      setIsThinking(true);
      try {
        const history = collectedRef.current
          .filter((e) => e.questionId === question.id && e.answerText.trim())
          .slice(-6)
          .map((e) => ({ prompt: e.promptText ?? question.question_text, answer: e.answerText }));
        // Drop the just-submitted answer from history (passed separately as `answer`).
        history.pop();
        const result = await requestInterviewFollowup({
          interviewId,
          questionId: question.id,
          questionText: question.question_text,
          answer: answerText,
          followupNumber: askedSoFar,
          history,
        });
        if (result.type === "followup" && result.text?.trim()) {
          setFollowupPrompt(result.text.trim());
          setFollowupCount(askedSoFar + 1);
        } else {
          await advanceOrFinish();
        }
      } catch {
        await advanceOrFinish();
      } finally {
        setIsThinking(false);
      }
    };

    const handleAnswerSubmit = async (answer: string, timeSpent: number) => {
      const question = questions[currentQuestionIndex];
      const isFollowupTurn = followupPrompt !== null;

      const entry: AnswerType = {
        clientId: newClientId(),
        questionId: question.id,
        answerText: answer,
        timeSpent,
        followupOf: isFollowupTurn ? parentClientIdRef.current : null,
        promptText: isFollowupTurn ? followupPrompt : null,
      };
      collectedRef.current.push(entry);

      if (!isFollowupTurn) {
        parentClientIdRef.current = entry.clientId ?? null;
        await maybeFollowup(question, answer, 0);
      } else {
        await maybeFollowup(question, answer, followupCount);
      }
    };

    const activeQuestion: QuestionType =
      followupPrompt !== null
        ? followupQuestion(questions[currentQuestionIndex], followupCount, followupPrompt)
        : questions[currentQuestionIndex];



  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
        {currentState === "start" && <InterviewStart onStart={handleStart} />}

        {currentState === "interview" && (
          <>
            {isThinking ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <p className="text-sm font-medium text-gray-500">Interviewer is thinking…</p>
                <TypingIndicator />
              </div>
            ) : (
              <InterviewQuestions
                key={activeQuestion.id}
                interviewId={interviewId}
                question={activeQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                onAnswerSubmit={handleAnswerSubmit}
                badge={followupPrompt !== null ? `Follow-up ${followupCount}/${MAX_FOLLOWUPS}` : undefined}
                timeLimit={followupPrompt !== null ? FOLLOWUP_TIME_LIMIT : undefined}
              />
            )}
          </>
        )}
        {currentState === "result" && (
          <InterviewResults
            interviewId={interviewId}



          />
        )}

        {isSubmitting && <p className="mt-4 text-sm text-gray-500">Submitting…</p>}
      </div>
    </div>
  )
}

export default InterviewClient
