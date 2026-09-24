import type { AnswerOption, QuestionType } from './test'

export interface UserAnswerSubmission {
  question_id: string
  selected_option_ids: string[]
}

export interface TestSubmissionPayload {
  answers: UserAnswerSubmission[]
}

export interface QuestionResult {
  question_id: string
  question_text: string
  question_type: QuestionType
  options: AnswerOption[]
  user_answers: string[]
  correct_answers: string[]
  is_correct: boolean
  explanation: string
}

export interface ResultSummary {
  id: string
  user_id: string
  user_username: string
  test_id: string
  test_title: string
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  completed_at: string
}

export interface ResultDetail {
  id: string
  user_id: string
  user_username: string
  test_id: string
  test_title: string
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  breakdown: QuestionResult[]
  completed_at: string
}

