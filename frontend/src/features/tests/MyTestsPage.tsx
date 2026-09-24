import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import {
  useDeleteTestMutation,
  useGetMyTestsQuery,
  usePublishTestMutation,
  useUnpublishTestMutation,
} from '@/store/api/testsApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  CheckCircle,
  Clock,
  Edit,
  FileQuestion,
  HelpCircle,
  PlusCircle,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react'

export const MyTestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { data: myTests, isLoading, refetch } = useGetMyTestsQuery()
  const [publishTest, { isLoading: isPublishing }] = usePublishTestMutation()
  const [unpublishTest, { isLoading: isUnpublishing }] = useUnpublishTestMutation()
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation()

  const [testToDelete, setTestToDelete] = useState<{ id: string; title: string } | null>(null)

  const handleTogglePublish = async (testId: string, currentlyPublished: boolean) => {
    try {
      if (currentlyPublished) {
        await unpublishTest(testId).unwrap()
        dispatch(addToast({ type: 'info', text: 'Test unpublished (now Draft)' }))
      } else {
        await publishTest(testId).unwrap()
        dispatch(addToast({ type: 'success', text: 'Test successfully published!' }))
      }
      refetch()
    } catch (err: any) {
      const msg = err?.data?.detail || 'Failed to update test publication status'
      dispatch(addToast({ type: 'error', text: msg }))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return
    try {
      await deleteTest(testToDelete.id).unwrap()
      dispatch(addToast({ type: 'success', text: `Deleted "${testToDelete.title}"` }))
      setTestToDelete(null)
      refetch()
    } catch (err: any) {
      const msg = err?.data?.detail || 'Failed to delete test'
      dispatch(addToast({ type: 'error', text: msg }))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <FileQuestion className="h-8 w-8 text-primary" />
            My Authored Tests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your created tests, update questions, and publish to the public catalog.
          </p>
        </div>
        <Button
          onClick={() => dispatch(navigate({ view: 'create-test' }))}
          className="self-start sm:self-auto gap-2 font-semibold shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Test
        </Button>
      </div>

      {/* Tests Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : !myTests || myTests.length === 0 ? (
        <Card className="p-12 text-center bg-muted/20 border-dashed">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileQuestion className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold">You haven't created any tests yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Design questions with single or multiple answers and publish them for users to take.
          </p>
          <Button
            onClick={() => dispatch(navigate({ view: 'create-test' }))}
            className="mt-5 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Your First Test
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myTests.map((test) => (
            <Card
              key={test.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={test.is_published ? 'success' : 'secondary'} className="gap-1">
                    {test.is_published ? (
                      <>
                        <CheckCircle className="h-3 w-3" /> Published
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" /> Draft
                      </>
                    )}
                  </Badge>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {test.category}
                  </span>
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {test.difficulty}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground truncate">{test.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {test.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <HelpCircle className="h-3.5 w-3.5" />
                    {test.question_count} {test.question_count === 1 ? 'question' : 'questions'}
                  </span>
                  <span>Updated on {new Date(test.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(navigate({ view: 'edit-test', param: test.id }))}
                  className="gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  Edit
                </Button>

                <Button
                  variant={test.is_published ? 'secondary' : 'default'}
                  size="sm"
                  disabled={isPublishing || isUnpublishing}
                  onClick={() => handleTogglePublish(test.id, test.is_published)}
                  className="gap-1.5"
                >
                  {test.is_published ? (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-amber-600" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Publish
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  onClick={() => setTestToDelete({ id: test.id, title: test.title })}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete Test"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!testToDelete}
        title="Delete Test"
        description={`Are you sure you want to permanently delete "${testToDelete?.title}"? All questions will be lost.`}
        confirmText="Delete Test"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTestToDelete(null)}
      />
    </div>
  )
}
