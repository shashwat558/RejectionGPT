-- Follow-up turns for the interactive interviewer (Phase C).
-- Main answers: followup_of IS NULL. Follow-up answers link to the
-- client-generated id of their parent answer row (inserted in one batch,
-- parents first). prompt_text stores the interviewer's follow-up question.
-- All columns nullable additions — old rows and old code paths unaffected.
alter table public.interview_answers
  add column if not exists followup_of uuid,
  add column if not exists prompt_text text;

create index if not exists interview_answers_followup_idx
  on public.interview_answers (interview_id, followup_of);
