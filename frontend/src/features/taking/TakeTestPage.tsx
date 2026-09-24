import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import { useGetTestForTakingQuery } from '@/store/api/testsApi'
import { useSubmitTestMutation } from '@/store/api/resultsApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Send,
} from 'lucide-react'

export const TakeTestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const testId = useSelector((state: RootState) => state.navigation.param)

  const { data: test, isLoading, error } = useGetTestForTakingQuery(testId || '', {
    skip: !testId,
  })

  const [submitTest, { isLoading: isSubmitting }] = useSubmitTestMutation()

  // State: active question index (0-based)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Map of question_id -> array of selected option IDs
  const [answers, setAnswers] = useState<Record<string, string[]>>({})

  // Review mode and confirmation dialog
  const [showReview, setShowReview] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  const questions = test?.questions || []
  const currentQuestion = questions[currentQuestionIndex]

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers((prev) => {
      const currentSelected = prev[questionId] || []
      if (isMulti) {
        const exists = currentSelected.includes(optionId)
        const updated = exists
          ? currentSelected.filter((id) => id !== optionId)
          : [...currentSelected, optionId]
        return { ...prev, [questionId]: updated }
      } else {
        return { ...prev, [questionId]: [optionId] }
      }
    })
  }

  const answeredCount = Object.values(answers).filter((arr) => arr.length > 0).length
  const totalCount = questions.length
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  const handleFinalSubmit = async () => {
    if (!testId) return

    const payload = {
      testId,
      submission: {
        answers: Object.entries(answers).map(([question_id, selected_option_ids]) => ({
          question_id,
          selected_option_ids,
        })),
      },
    }

    try {
      const result = await submitTest(payload).unwrap()
      dispatch(addToast({ type: 'success', text: 'Test submitted successfully!' }))
      dispatch(navigate({ view: 'result', param: result.id }))
    } catch (err: any) {
      const msg = err?.data?.detail || 'Failed to submit test'
      dispatch(addToast({ type: 'error', text: msg }))
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 space-y-4">
        <div className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse" />
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center">
        <Card className="p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold mt-4">Unable to Load Test</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This test may not exist or has not been published yet.
          </p>
          <Button
            onClick={() => dispatch(navigate({ view: 'tests' }))}
            className="mt-6"
          >
            Back to Tests Catalog
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Test Meta Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {test.category}
            </span>
            <Badge variant="outline" className="capitalize text-[11px]">
              {test.difficulty}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{test.title}</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReview(!showReview)}
          className="gap-1.5"
        >
          <Layers className="h-4 w-4" />
          {showReview ? 'Back to Questions' : 'Review All'}
        </Button>
      </div>

      {/* Progress & Question Navigation Drawer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>
            Progress: {answeredCount} of {totalCount} answered ({progressPercent}%)
          </span>
          <span>Question {currentQuestionIndex + 1} of {totalCount}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick jump question numbers */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {questions.map((q, idx) => {
            const isAnswered = (answers[q.id] || []).length > 0
            const isCurrent = idx === currentQuestionIndex && !showReview

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentQuestionIndex(idx)
                  setShowReview(false)
                }}
                className={`h-8 w-8 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground'
                    : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Test Body: Question View or Review View */}
      {showReview ? (
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
            <CardDescription>
              Check your progress before final submission. Click on any question to modify your answer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((q, idx) => {
              const selectedOptIds = answers[q.id] || []
              const hasAnswer = selectedOptIds.length > 0

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx)
                    setShowReview(false)
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Question #{idx + 1}
                    </span>
                    <p className="text-sm font-medium line-clamp-1">{q.question_text}</p>
                  </div>
                  <div>
                    {hasAnswer ? (
                      <Badge variant="success" className="gap-1 text-xs">
                        <Check className="h-3 w-3" /> Answered
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unanswered
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={() => setShowReview(false)}>
              Back to Questions
            </Button>
            <Button
              onClick={() => setShowConfirmSubmit(true)}
              className="gap-2 font-semibold"
            >
              <Send className="h-4 w-4" />
              Finish & Submit Test
            </Button>
          </CardFooter>
        </Card>
      ) : (
        currentQuestion && (
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <Badge variant="default" className="text-[11px]">
                  Question {currentQuestionIndex + 1} of {totalCount}
                </Badge>
                <span className="capitalize font-medium">
                  {currentQuestion.question_type.replace('_', ' ')}
                  {currentQuestion.question_type === 'multiple_choice' &&
                    ' (Select all that apply)'}
                </span>
              </div>
              <CardTitle className="text-xl font-bold leading-snug">
                {currentQuestion.question_text}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selectedList = answers[currentQuestion.id] || []
                const isSelected = selectedList.includes(option.id)
                const isMulti = currentQuestion.question_type === 'multiple_choice'

                return (
                  <div
                    key={option.id}
                    onClick={() =>
                      handleSelectOption(currentQuestion.id, option.id, isMulti)
                    }
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs text-foreground font-medium'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    {/* Checkbox / Radio Visual */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
                        isMulti ? 'rounded-md' : 'rounded-full'
                      } border ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input'
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </div>

                    <span className="text-sm flex-1">{option.text}</span>
                  </div>
                )
              })}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < totalCount - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="gap-1"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                    Submit Test
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )
      )}

      {/* Confirmation Dialog before Submitting */}
      <ConfirmDialog
        open={showConfirmSubmit}
        title="Submit Test?"
        description={
          answeredCount < totalCount
            ? `You have answered ${answeredCount} of ${totalCount} questions. Unanswered questions will be scored as incorrect. Are you ready to submit?`
            : `You have answered all ${totalCount} questions. Once submitted, you cannot change your answers.`
        }
        confirmText="Confirm & Submit"
        loading={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
      />
    </div>
  )
}
