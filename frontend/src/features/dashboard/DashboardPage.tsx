import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { useGetPublishedTestsQuery } from '@/store/api/testsApi'
import { useGetMyResultsQuery } from '@/store/api/resultsApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const { data: publishedTests, isLoading: testsLoading } = useGetPublishedTestsQuery()
  const { data: myResults, isLoading: resultsLoading } = useGetMyResultsQuery(undefined, {
    skip: !isAuthenticated,
  })

  const recentTests = (publishedTests || []).slice(0, 4)
  const recentResults = (myResults || []).slice(0, 3)

  const difficultyVariant = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'success'
      case 'hard':
        return 'destructive'
      default:
        return 'warning'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Knowledge Evaluation
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {isAuthenticated
              ? `Welcome back, ${user?.username}!`
              : 'Create, Share, and Master Tests with QuizCraft'}
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Build customized quizzes with single choice, multiple choice, and true/false questions, or challenge yourself with tests created by the community.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => dispatch(navigate({ view: 'tests' }))}
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-md gap-2"
            >
              <Compass className="h-4 w-4" />
              Explore All Tests
            </Button>
            {isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => dispatch(navigate({ view: 'create-test' }))}
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Create New Test
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => dispatch(navigate({ view: 'register' }))}
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold gap-2"
              >
                Join Now Free
              </Button>
            )}
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 top-4 hidden lg:block opacity-20 text-white">
          <GraduationCap className="h-48 w-48" />
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary" onClick={() => dispatch(navigate({ view: 'tests' }))}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Browse Tests</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Discover tests in science, programming, history, and general trivia.
            </p>
          </CardContent>
          <CardFooter className="text-xs text-primary font-medium flex items-center gap-1">
            Browse catalog <ArrowRight className="h-3 w-3" />
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-indigo-500" onClick={() => dispatch(navigate({ view: isAuthenticated ? 'create-test' : 'login' }))}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Author a Test</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <PlusCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Design questions with automatic grading, custom options, and detailed answer explanations.
            </p>
          </CardContent>
          <CardFooter className="text-xs text-indigo-600 font-medium flex items-center gap-1">
            Start authoring <ArrowRight className="h-3 w-3" />
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500" onClick={() => dispatch(navigate({ view: isAuthenticated ? 'my-results' : 'login' }))}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Track Progress</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Inspect test attempts, review correct answers, and monitor knowledge improvements.
            </p>
          </CardContent>
          <CardFooter className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            View history <ArrowRight className="h-3 w-3" />
          </CardFooter>
        </Card>
      </div>

      {/* Available Tests Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Featured Tests
            </h2>
            <p className="text-sm text-muted-foreground">
              Published tests ready to test your knowledge right now
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(navigate({ view: 'tests' }))}
            className="text-primary gap-1 font-medium"
          >
            View all ({publishedTests?.length || 0})
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {testsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-xl border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : recentTests.length === 0 ? (
          <Card className="p-8 text-center bg-muted/20 border-dashed">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">No published tests yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Be the first creator to author and publish an exciting test for the community!
            </p>
            {isAuthenticated && (
              <Button
                size="sm"
                onClick={() => dispatch(navigate({ view: 'create-test' }))}
                className="mt-4 gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                Create a Test
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentTests.map((test) => (
              <Card key={test.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                      {test.category}
                    </span>
                    <Badge variant={difficultyVariant(test.difficulty) as any} className="capitalize">
                      {test.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
                    {test.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {test.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-0 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{test.question_count} questions</span>
                  </div>
                  <div className="truncate">By {test.creator_username}</div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    size="sm"
                    className="w-full gap-1.5 font-medium"
                    onClick={() =>
                      dispatch(navigate({ view: isAuthenticated ? 'take-test' : 'login', param: test.id }))
                    }
                  >
                    Start Test
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User's Recent Results (if authenticated) */}
      {isAuthenticated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Your Recent Results
              </h2>
              <p className="text-sm text-muted-foreground">
                Review your latest scores and test explanations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(navigate({ view: 'my-results' }))}
              className="text-primary gap-1 font-medium"
            >
              All Results
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {resultsLoading ? (
            <div className="h-24 rounded-xl border border-border bg-muted/30 animate-pulse" />
          ) : recentResults.length === 0 ? (
            <Card className="p-6 text-center bg-muted/20 border-dashed">
              <p className="text-sm text-muted-foreground">
                You haven't taken any tests yet. Choose a test above to begin!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentResults.map((res) => (
                <Card
                  key={res.id}
                  className="p-4 hover:shadow-xs transition-shadow cursor-pointer flex items-center justify-between"
                  onClick={() => dispatch(navigate({ view: 'result', param: res.id }))}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm line-clamp-1">{res.test_title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(res.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-base font-bold">
                        {res.score}/{res.total_questions}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        {res.percentage}%
                      </div>
                    </div>
                    <Badge variant={res.passed ? 'success' : 'destructive'}>
                      {res.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
