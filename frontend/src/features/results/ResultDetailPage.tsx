import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { useGetResultByIdQuery } from '@/store/api/resultsApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react'

export const ResultDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const resultId = useSelector((state: RootState) => state.navigation.param)

  const { data: result, isLoading, error } = useGetResultByIdQuery(resultId || '', {
    skip: !resultId,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 space-y-4">
        <div className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center">
        <Card className="p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold mt-4">Result Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2">
            The requested test result could not be located or you don't have access to it.
          </p>
          <Button
            onClick={() => dispatch(navigate({ view: 'my-results' }))}
            className="mt-6"
          >
            Go to My Results
          </Button>
        </Card>
      </div>
    )
  }

  const correctCount = result.score
  const totalCount = result.total_questions
  const incorrectCount = totalCount - correctCount

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      {/* Top Back Action */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch(navigate({ view: 'my-results' }))}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Results
        </Button>

        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Completed on {new Date(result.completed_at).toLocaleString()}
        </span>
      </div>

      {/* Hero Score Card */}
      <Card
        className={`border-2 shadow-md ${
          result.passed
            ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/5 to-background'
            : 'border-rose-500/50 bg-gradient-to-b from-rose-500/5 to-background'
        }`}
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-xs border">
            {result.passed ? (
              <Award className="h-8 w-8 text-emerald-600" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-600" />
            )}
          </div>
          <Badge
            variant={result.passed ? 'success' : 'destructive'}
            className="mx-auto text-sm px-3 py-1 font-bold"
          >
            {result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
          </Badge>
          <CardTitle className="text-2xl font-extrabold mt-3">
            {result.test_title}
          </CardTitle>
          <CardDescription>
            Performance breakdown and answer evaluation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-card border p-3 shadow-xs">
              <div className="text-2xl font-extrabold text-foreground">
                {result.percentage}%
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-0.5">
                Score Percentage
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 shadow-xs">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </div>
              <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 mt-0.5">
                Correct Answers
              </div>
            </div>

            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 shadow-xs">
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                {incorrectCount}
              </div>
              <div className="text-xs font-medium text-rose-800 dark:text-rose-300 mt-0.5">
                Incorrect Answers
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() =>
              dispatch(navigate({ view: 'take-test', param: result.test_id }))
            }
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Test
          </Button>
          <Button
            onClick={() => dispatch(navigate({ view: 'tests' }))}
            className="gap-2"
          >
            <Compass className="h-4 w-4" />
            Explore More Tests
          </Button>
        </CardFooter>
      </Card>

      {/* Question by Question Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          Detailed Question Breakdown ({result.breakdown.length})
        </h2>

        <div className="space-y-4">
          {result.breakdown.map((q, idx) => {
            const userChoiceSet = new Set(q.user_answers)
            const correctChoiceSet = new Set(q.correct_answers)

            return (
              <Card
                key={q.question_id || idx}
                className={`border-l-4 shadow-xs ${
                  q.is_correct ? 'border-l-emerald-600' : 'border-l-rose-600'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={q.is_correct ? 'success' : 'destructive'} className="text-xs">
                      {q.is_correct ? 'Correct' : 'Incorrect'}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize font-medium">
                      {q.question_type.replace('_', ' ')}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">
                    {idx + 1}. {q.question_text}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Options List */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt) => {
                      const isUserChoice = userChoiceSet.has(opt.id)
                      const isTargetCorrect = correctChoiceSet.has(opt.id)

                      let optionStyle =
                        'border-border bg-background text-muted-foreground'
                      if (isTargetCorrect) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-medium'
                      } else if (isUserChoice && !isTargetCorrect) {
                        optionStyle =
                          'border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-100 line-through'
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${optionStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            {isTargetCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                            {isUserChoice && !isTargetCorrect && (
                              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            )}
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            {isUserChoice && (
                              <Badge variant="outline" className="text-[10px]">
                                Your Answer
                              </Badge>
                            )}
                            {isTargetCorrect && (
                              <Badge variant="success" className="text-[10px]">
                                Correct Choice
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation (if provided) */}
                  {q.explanation && (
                    <div className="rounded-lg bg-muted/50 border border-muted p-3 text-xs space-y-1 mt-2">
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        Explanation:
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
