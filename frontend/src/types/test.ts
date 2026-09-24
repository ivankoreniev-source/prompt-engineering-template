export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface AnswerOption {
  id: string
  text: string
}

export interface QuestionInput {
  id?: string
  question_text: string
  question_type: QuestionType
  options: AnswerOption[]
  correct_answers: string[]
  explanation?: string
}

export interface QuestionInDb {
  id: string
  question_text: string
  question_type: QuestionType
  options: AnswerOption[]
  correct_answers: string[]
  explanation: string
}

export interface QuestionPublic {
  id: string
  question_text: string
  question_type: QuestionType
  options: AnswerOption[]
}

export interface TestSummary {
  id: string
  creator_id: string
  creator_username: string
  title: string
  description: string
  category: string
  difficulty: DifficultyLevel
  question_count: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TestDetail {
  id: string
  creator_id: string
  creator_username: string
  title: string
  description: string
  category: string
  difficulty: DifficultyLevel
  questions: QuestionInDb[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface TestTake {
  id: string
  creator_username: string
  title: string
  description: string
  category: string
  difficulty: DifficultyLevel
  questions: QuestionPublic[]
}

export interface CreateTestPayload {
  title: string
  description?: string
  category: string
  difficulty: DifficultyLevel
  questions: QuestionInput[]
}

export interface UpdateTestPayload {
  title?: string
  description?: string
  category?: string
  difficulty?: DifficultyLevel
  questions?: QuestionInput[]
}
