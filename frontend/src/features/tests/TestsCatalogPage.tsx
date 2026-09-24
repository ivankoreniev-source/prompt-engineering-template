import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { useGetPublishedTestsQuery } from '@/store/api/testsApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Filter,
  HelpCircle,
  PlusCircle,
  Search,
  User,
} from 'lucide-react'

export const TestsCatalogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const { data: tests, isLoading } = useGetPublishedTestsQuery({
    search: search.trim() || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
  })

  const categories = [
    'all',
    'General',
    'Science',
    'Programming',
    'History',
    'Math',
    'Geography',
    'Languages',
  ]

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-primary" />
            Explore Published Tests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse through hundreds of user-created tests, sharpen your skills, and challenge your mind.
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => dispatch(navigate({ view: 'create-test' }))}
            className="self-start md:self-auto gap-2 font-semibold shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            Create a Test
          </Button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests by title, description, or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Test Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : !tests || tests.length === 0 ? (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Filter className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold">No tests match your filter</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting different categories, or create a brand new test.
          </p>
          {(search || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="flex flex-col justify-between hover:shadow-md transition-all border border-border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {test.category}
                  </span>
                  <Badge
                    variant={difficultyVariant(test.difficulty) as any}
                    className="capitalize text-[11px]"
                  >
                    {test.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold line-clamp-1">
                  {test.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs min-h-[2rem]">
                  {test.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{test.creator_username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{test.question_count} questions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Published on {new Date(test.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/50">
                <Button
                  className="w-full gap-2 font-medium"
                  onClick={() =>
                    dispatch(
                      navigate({
                        view: isAuthenticated ? 'take-test' : 'login',
                        param: test.id,
                      }),
                    )
                  }
                >
                  Start Test
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
