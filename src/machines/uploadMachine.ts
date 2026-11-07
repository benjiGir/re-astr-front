import { assign, fromPromise, setup } from 'xstate'
import type { CreateTestDto, Test } from '../api/schemas/test.schema'
import { categoryOptions } from '../api/queries/categories.queries'
import * as testsService from '../api/services/tests.service'
import { queryClient } from '../services/queryClient'

export interface UploadIssue {
  path: string
  message: string
}

/**
 * R1: this machine never stores server data (Project[], Category, ...) in
 * its context — only flow state. `pendingInput` is the one exception: a
 * one-shot snapshot of the RHF-validated payload taken at SUBMIT time so
 * `submitting`/RETRY can re-invoke the same request, not a mirror of live
 * form state (R2 — RHF owns the fields, this machine owns the flow).
 */
export interface UploadContext {
  files: File[]
  selectedProjectId: string | null
  selectedCategoryId: string | null
  pendingInput: CreateTestDto | null
  createdTestId: string | null
  issues: UploadIssue[]
  retries: number
}

export type UploadEvent =
  | { type: 'FILES_SELECTED'; files: File[] }
  | { type: 'PROJECT_SELECTED'; projectId: string }
  | { type: 'CATEGORY_SELECTED'; categoryId: string }
  | { type: 'SUBMIT'; input: CreateTestDto }
  | { type: 'RETRY' }
  | { type: 'CANCEL' }

export const MAX_FILES = 10
export const MAX_FILE_SIZE = 30 * 1024 * 1024
const MAX_RETRIES = 3

export function validateFiles(files: File[]): UploadIssue[] {
  const issues: UploadIssue[] = []
  if (files.length === 0) {
    issues.push({ path: 'files', message: 'At least one file is required' })
  }
  if (files.length > MAX_FILES) {
    issues.push({ path: 'files', message: `No more than ${MAX_FILES} files allowed` })
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      issues.push({
        path: 'files',
        message: `"${file.name}" exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      })
    }
  }
  return issues
}

export const uploadMachine = setup({
  types: {} as {
    context: UploadContext
    events: UploadEvent
  },
  actors: {
    // Warms the React Query cache for the selected category instead of
    // fetching+storing the category in machine context (R1) — the
    // component reads it back via the same `categoryOptions(id)` query.
    warmCategoryCache: fromPromise<void, { categoryId: string }>(({ input }) =>
      queryClient.ensureQueryData(categoryOptions(input.categoryId)).then(() => undefined),
    ),
    createTest: fromPromise<Test, CreateTestDto>(({ input, signal }) =>
      testsService.createTest(input, signal),
    ),
  },
  guards: {
    filesValid: ({ context }) => validateFiles(context.files).length === 0,
    canRetry: ({ context }) => context.retries < MAX_RETRIES,
  },
}).createMachine({
  id: 'upload',
  initial: 'collecting',
  context: {
    files: [],
    selectedProjectId: null,
    selectedCategoryId: null,
    pendingInput: null,
    createdTestId: null,
    issues: [],
    retries: 0,
  },
  states: {
    // FILES_SELECTED/PROJECT_SELECTED/CATEGORY_SELECTED behave identically
    // no matter which of this state's children is active (bug found live:
    // these were only wired on collectingMetadata/fillingDynamicFields,
    // so a category picked before a file was present was silently
    // dropped — idle had no handler for it at all). Defining them once on
    // the shared parent, instead of copy-pasting into every child,
    // structurally rules out that class of bug: a new child state gets
    // this handling for free. They never apply to submitting/submitFailed/
    // success, which live outside this compound state.
    collecting: {
      initial: 'idle',
      on: {
        FILES_SELECTED: {
          target: '.validatingFiles',
          actions: assign({ files: ({ event }) => event.files }),
        },
        PROJECT_SELECTED: {
          actions: assign({ selectedProjectId: ({ event }) => event.projectId }),
        },
        CATEGORY_SELECTED: {
          target: '.loadingCategorySchema',
          actions: assign({ selectedCategoryId: ({ event }) => event.categoryId }),
        },
      },
      states: {
        idle: {},
        validatingFiles: {
          always: [
            {
              guard: 'filesValid',
              target: 'collectingMetadata',
              actions: assign({ issues: [] }),
            },
            {
              target: 'idle',
              actions: assign({ issues: ({ context }) => validateFiles(context.files) }),
            },
          ],
        },
        collectingMetadata: {},
        loadingCategorySchema: {
          invoke: {
            src: 'warmCategoryCache',
            input: ({ context }) => ({ categoryId: context.selectedCategoryId as string }),
            onDone: {
              target: 'fillingDynamicFields',
              actions: assign({ issues: [] }),
            },
            onError: {
              target: 'collectingMetadata',
              actions: assign({
                issues: [{ path: 'category', message: 'Failed to load the category fields' }],
              }),
            },
          },
        },
        fillingDynamicFields: {
          id: 'fillingDynamicFields',
          on: {
            SUBMIT: {
              target: '#submitting',
              actions: assign({
                pendingInput: ({ event }) => event.input,
                retries: 0,
              }),
            },
          },
        },
      },
    },
    submitting: {
      id: 'submitting',
      invoke: {
        src: 'createTest',
        input: ({ context }) => context.pendingInput as CreateTestDto,
        onDone: {
          target: 'success',
          actions: assign({ createdTestId: ({ event }) => event.output.id }),
        },
        onError: {
          target: 'submitFailed',
          actions: assign({
            issues: [{ path: 'submit', message: 'Failed to create the test' }],
          }),
        },
      },
    },
    submitFailed: {
      on: {
        RETRY: {
          guard: 'canRetry',
          target: 'submitting',
          actions: assign({ retries: ({ context }) => context.retries + 1 }),
        },
        CANCEL: { target: '#fillingDynamicFields' },
      },
    },
    success: {
      type: 'final',
    },
  },
})
