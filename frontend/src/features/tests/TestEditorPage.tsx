import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import {
  useCreateTestMutation,
  useGetTestForCreatorQuery,
  usePublishTestMutation,
  useUpdateTestMutation,
} from '@/store/api/testsApi'
import type {
  AnswerOption,
  DifficultyLevel,
  QuestionInput,
  QuestionType,
} from '@/types/test'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileQuestion,
  HelpCircle,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react'

const createDefaultQuestion = (type: QuestionType = 'single_choice'): QuestionInput => {
  const qId = 'temp_q_' + Date.now().toString() + Math.random().toString(36).slice(2, 5)
  if (type === 'true_false') {
    const optTrue = { id: 'opt_true_' + Date.now(), text: 'True' }
    const optFalse = { id: 'opt_false_' + Date.now(), text: 'False' }
    return {
      id: qId,
      question_text: '',
      question_type: 'true_false',
      options: [optTrue, optFalse],
      correct_answers: [optTrue.id],
      explanation: '',
    }
  }
  const opt1 = { id: 'opt_1_' + Date.now(), text: '' }
  const opt2 = { id: 'opt_2_' + Date.now(), text: '' }
  return {
    id: qId,
    question_text: '',
    question_type: 'single_choice',
    options: [opt1, opt2],
    correct_answers: [opt1.id],
    explanation: '',
  }
}

export const TestEditorPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const editingTestId = useSelector(
    (state: RootState) => state.navigation.param,
  )
  const isEditing = !!editingTestId

  const { data: existingTest, isLoading: loadingExisting } =
    useGetTestForCreatorQuery(editingTestId || '', {
      skip: !isEditing,
    })

  const [createTest, { isLoading: isCreating }] = useCreateTestMutation()
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation()
  const [publishTest, { isLoading: isPublishing }] = usePublishTestMutation()

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [questions, setQuestions] = useState<QuestionInput[]>(() =>
    isEditing ? [] : [createDefaultQuestion()],
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  // Initialize form when editing
  useEffect(() => {
    if (existingTest) {
      setTitle(existingTest.title)
      setDescription(existingTest.description || '')
      setCategory(existingTest.category)
      setDifficulty(existingTest.difficulty)
      setQuestions(
        existingTest.questions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
          correct_answers: [...q.correct_answers],
          explanation: q.explanation || '',
        })),
      )
    }
  }, [existingTest])

  const handleAddQuestion = (type: QuestionType = 'single_choice') => {
    const qId = 'temp_q_' + Date.now().toString() + Math.random().toString(36).slice(2, 5)

    let initialOptions: AnswerOption[] = []
    let initialCorrect: string[] = []

    if (type === 'true_false') {
      const optTrue = { id: 'opt_true_' + Date.now(), text: 'True' }
      const optFalse = { id: 'opt_false_' + Date.now(), text: 'False' }
      initialOptions = [optTrue, optFalse]
      initialCorrect = [optTrue.id]
    } else {
      const opt1 = { id: 'opt_1_' + Date.now(), text: '' }
      const opt2 = { id: 'opt_2_' + Date.now(), text: '' }
      initialOptions = [opt1, opt2]
      initialCorrect = [opt1.id]
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: qId,
        question_text: '',
        question_type: type,
        options: initialOptions,
        correct_answers: initialCorrect,
        explanation: '',
      },
    ])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQuestionTypeChange = (index: number, newType: QuestionType) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const current = copy[index]
      let newOptions: AnswerOption[] = []
      let newCorrect: string[] = []

      if (newType === 'true_false') {
        const optTrue = { id: 'opt_true_' + Date.now(), text: 'True' }
        const optFalse = { id: 'opt_false_' + Date.now(), text: 'False' }
        newOptions = [optTrue, optFalse]
        newCorrect = [optTrue.id]
      } else {
        // Keep non-empty existing options or default to 2
        newOptions =
          current.options.length >= 2
            ? current.options.map((o) => ({ ...o }))
            : [
                { id: 'opt_1_' + Date.now(), text: '' },
                { id: 'opt_2_' + Date.now(), text: '' },
              ]
        newCorrect = newOptions.length > 0 ? [newOptions[0].id] : []
      }

      copy[index] = {
        ...current,
        question_type: newType,
        options: newOptions,
        correct_answers: newCorrect,
      }
      return copy
    })
  }

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const q = copy[qIndex]
      const newOpt = {
        id: 'opt_' + Date.now() + Math.random().toString(36).slice(2, 4),
        text: '',
      }
      copy[qIndex] = {
        ...q,
        options: [...q.options, newOpt],
      }
      return copy
    })
  }

  const handleRemoveOption = (qIndex: number, optId: string) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const q = copy[qIndex]
      if (q.options.length <= 2) {
        dispatch(addToast({ type: 'error', text: 'Each question must have at least 2 options' }))
        return prev
      }
      copy[qIndex] = {
        ...q,
        options: q.options.filter((o) => o.id !== optId),
        correct_answers: q.correct_answers.filter((id) => id !== optId),
      }
      return copy
    })
  }

  const handleOptionTextChange = (qIndex: number, optId: string, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const q = copy[qIndex]
      copy[qIndex] = {
        ...q,
        options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)),
      }
      return copy
    })
  }

  const handleToggleCorrectAnswer = (qIndex: number, optId: string) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const q = copy[qIndex]

      if (q.question_type === 'single_choice' || q.question_type === 'true_false') {
        // Single choice allows only 1 correct answer
        copy[qIndex] = {
          ...q,
          correct_answers: [optId],
        }
      } else {
        // Multiple choice toggles
        const exists = q.correct_answers.includes(optId)
        let updated: string[]
        if (exists) {
          updated = q.correct_answers.filter((id) => id !== optId)
        } else {
          updated = [...q.correct_answers, optId]
        }
        copy[qIndex] = {
          ...q,
          correct_answers: updated,
        }
      }
      return copy
    })
  }

  const validateTestLocally = (): string | null => {
    if (!title.trim()) {
      return 'Test title cannot be empty'
    }
    if (questions.length === 0) {
      return 'Please add at least one question to the test'
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) {
        return `Question #${i + 1} text is empty`
      }
      if (q.options.length < 2) {
        return `Question #${i + 1} must have at least 2 options`
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          return `Question #${i + 1}, Option #${j + 1} text is empty`
        }
      }
      if (q.correct_answers.length === 0) {
        return `Question #${i + 1} must have at least one correct answer selected`
      }
    }
    return null
  }

  const handleSave = async (andPublish = false) => {
    setValidationError(null)

    if (!title.trim()) {
      setValidationError('Please specify a title for the test')
      return
    }

    if (andPublish) {
      const err = validateTestLocally()
      if (err) {
        setValidationError(err)
        return
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      difficulty,
      questions,
    }

    try {
      let savedId = editingTestId

      if (isEditing && savedId) {
        await updateTest({ id: savedId, payload }).unwrap()
        dispatch(addToast({ type: 'success', text: 'Test updated successfully!' }))
      } else {
        const created = await createTest(payload).unwrap()
        savedId = created.id
        dispatch(addToast({ type: 'success', text: 'Test draft created!' }))
      }

      if (andPublish && savedId) {
        await publishTest(savedId).unwrap()
        dispatch(addToast({ type: 'success', text: 'Test published to catalog!' }))
      }

      dispatch(navigate({ view: 'my-tests' }))
    } catch (err: any) {
      const message = err?.data?.detail || 'Failed to save test'
      setValidationError(message)
    }
  }

  if (isEditing && loadingExisting) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4">
        <div className="h-64 rounded-xl border border-border bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(navigate({ view: 'my-tests' }))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure test details, questions, correct answers, and explanations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isCreating || isUpdating || isPublishing}
            onClick={() => handleSave(false)}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            size="sm"
            disabled={isCreating || isUpdating || isPublishing}
            onClick={() => handleSave(true)}
            className="gap-1.5 font-semibold"
          >
            <Send className="h-4 w-4" />
            Publish Test
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Test Meta Card */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Test Details</CardTitle>
          <CardDescription>
            Basic metadata visible to test-takers in the public catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">
              Test Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="test-title"
              placeholder="e.g. World Geography Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-desc">Description</Label>
            <Textarea
              id="test-desc"
              placeholder="What will users test or learn in this quiz?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-cat">Category</Label>
              <select
                id="test-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="General">General</option>
                <option value="Science">Science</option>
                <option value="Programming">Programming</option>
                <option value="History">History</option>
                <option value="Math">Math</option>
                <option value="Geography">Geography</option>
                <option value="Languages">Languages</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-diff">Difficulty Level</Label>
              <select
                id="test-diff"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              Questions ({questions.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure each question, its options, and the designated correct answer(s).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuestion('single_choice')}
              className="gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Single Choice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuestion('multiple_choice')}
              className="gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Multi-Choice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuestion('true_false')}
              className="gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add True/False
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <Card className="p-8 text-center bg-muted/20 border-dashed">
            <p className="text-sm text-muted-foreground">
              No questions yet. Click one of the buttons above to add your first question.
            </p>
          </Card>
        ) : (
          questions.map((q, qIndex) => (
            <Card key={q.id || qIndex} className="shadow-xs border-l-4 border-l-primary">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    Question #{qIndex + 1}
                  </Badge>
                  <select
                    value={q.question_type}
                    onChange={(e) =>
                      handleQuestionTypeChange(qIndex, e.target.value as QuestionType)
                    }
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium cursor-pointer"
                  >
                    <option value="single_choice">Single Choice (1 correct)</option>
                    <option value="multiple_choice">Multiple Choice (1+ correct)</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-muted-foreground hover:text-destructive h-8 px-2"
                  title="Remove Question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <Label>Question Text</Label>
                  <Input
                    placeholder="Enter question prompt..."
                    value={q.question_text}
                    onChange={(e) => {
                      const text = e.target.value
                      setQuestions((prev) => {
                        const copy = [...prev]
                        copy[qIndex] = { ...copy[qIndex], question_text: text }
                        return copy
                      })
                    }}
                    required
                  />
                </div>

                {/* Answer Options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Answer Options (Click checkmark to select correct answer)
                    </Label>
                    {q.question_type !== 'true_false' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddOption(qIndex)}
                        className="h-7 text-xs text-primary gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.correct_answers.includes(opt.id)
                      const isTrueFalse = q.question_type === 'true_false'

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-background border-border'
                          }`}
                        >
                          {/* Correct Answer Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleCorrectAnswer(qIndex, opt.id)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer ${
                              isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-input hover:border-primary text-muted-foreground'
                            }`}
                            title={isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                          >
                            {isCorrect && <Check className="h-3.5 w-3.5" />}
                          </button>

                          {/* Option Text Input */}
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt.text}
                            disabled={isTrueFalse}
                            onChange={(e) =>
                              handleOptionTextChange(qIndex, opt.id, e.target.value)
                            }
                            className={`h-8 text-sm ${isCorrect ? 'font-medium' : ''}`}
                          />

                          {/* Remove option button (if > 2 and not True/False) */}
                          {!isTrueFalse && q.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(qIndex, opt.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Explanation (Optional - shown after test submission)
                  </Label>
                  <Textarea
                    placeholder="Explain why this answer is correct..."
                    value={q.explanation || ''}
                    onChange={(e) => {
                      const text = e.target.value
                      setQuestions((prev) => {
                        const copy = [...prev]
                        copy[qIndex] = { ...copy[qIndex], explanation: text }
                        return copy
                      })
                    }}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => dispatch(navigate({ view: 'my-tests' }))}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          disabled={isCreating || isUpdating}
          onClick={() => handleSave(false)}
          className="gap-1.5"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button
          disabled={isPublishing || isCreating || isUpdating}
          onClick={() => handleSave(true)}
          className="gap-1.5 font-semibold"
        >
          <Send className="h-4 w-4" />
          Publish Test
        </Button>
      </div>
    </div>
  )
}
