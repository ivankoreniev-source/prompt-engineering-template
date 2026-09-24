import React from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { useGetMyResultsQuery } from '@/store/api/resultsApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Compass,
  TrendingUp,
} from 'lucide-react'

export const MyResultsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { data: results, isLoading } = useGetMyResultsQuery()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CheckCircle className="h-8 w-8 text-primary" />
            My Test History & Results
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review past test submissions, check answers, and track your knowledge scores over time.
          </p>
        </div>
        <Button
          onClick={() => dispatch(navigate({ view: 'tests' }))}
          className="self-start sm:self-auto gap-2 font-semibold shadow-xs"
        >
          <Compass className="h-4 w-4" />
          Take Another Test
        </Button>
      </div>

      {/* Results Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : !results || results.length === 0 ? (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold">No test attempts yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Take a published quiz from the catalog to see your results and evaluation breakdown here.
          </p>
          <Button
            onClick={() => dispatch(navigate({ view: 'tests' }))}
            className="mt-5 gap-2"
          >
            <Compass className="h-4 w-4" />
            Explore Tests Catalog
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((res) => (
            <Card
              key={res.id}
              onClick={() => dispatch(navigate({ view: 'result', param: res.id }))}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={res.passed ? 'success' : 'destructive'} className="text-xs">
                    {res.passed ? 'Passed' : 'Failed'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(res.completed_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground truncate hover:text-primary transition-colors">
                  {res.test_title}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Score: <span className="font-semibold text-foreground">{res.score}</span> /{' '}
                  {res.total_questions} questions answered correctly
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">
                    {res.percentage}%
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Final Grade
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-medium"
                >
                  View Report
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
