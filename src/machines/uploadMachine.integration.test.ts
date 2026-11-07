import { createActor, waitFor } from 'xstate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateTestDto, Test } from '../api/schemas/test.schema'
import { queryClient } from '../services/queryClient'
import { uploadMachine } from './uploadMachine'

/**
 * Exit criterion (docs/PLAN.md §3.6): a Test is actually created. Runs the
 * *real* machine — no `.provide()` actor swaps — through the real
 * `testsService.createTest` and `categoriesApi.getCategoryById` and the real
 * `apiFetch`, mocking only `fetch` itself. `uploadMachine.test.ts` covers
 * the state graph in isolation with mocked actors; this covers the wiring
 * between the machine and the actual API layer.
 */
describe('uploadMachine — integration (real service + http stack)', () => {
  const fetchMock = vi.fn()

  const fakeCategory = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Category 1',
    baseSchema: { fields: [{ key: 'notes', label: 'Notes', type: 'text', required: false }] },
    customFieldsSchema: { allowCustomFields: false, fields: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const fakeTest: Test = {
    id: '22222222-2222-2222-2222-222222222222',
    projectId: '33333333-3333-3333-3333-333333333333',
    categoryId: fakeCategory.id,
    name: 'Integration test',
    status: 'draft',
    commonData: { notes: 'hello' },
    customData: {},
    createdBy: '44444444-4444-4444-4444-444444444444',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  function jsonResponse(data: unknown) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  beforeEach(() => {
    queryClient.clear()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  it('creates a real Test through FILES_SELECTED -> CATEGORY_SELECTED -> SUBMIT', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(fakeCategory)) // warmCategoryCache: GET /categories/:id
      .mockResolvedValueOnce(jsonResponse(fakeTest)) // createTest: POST /tests

    const actor = createActor(uploadMachine).start()
    actor.send({ type: 'FILES_SELECTED', files: [new File(['x'], 'notes.txt')] })
    actor.send({ type: 'PROJECT_SELECTED', projectId: fakeTest.projectId })
    actor.send({ type: 'CATEGORY_SELECTED', categoryId: fakeCategory.id })

    await waitFor(actor, (s) => s.matches({ collecting: 'fillingDynamicFields' }), {
      timeout: 1000,
    })

    const input: CreateTestDto = {
      projectId: fakeTest.projectId,
      categoryId: fakeCategory.id,
      name: fakeTest.name,
      commonData: { notes: 'hello' },
    }
    actor.send({ type: 'SUBMIT', input })

    await waitFor(actor, (s) => s.value === 'success', { timeout: 1000 })
    expect(actor.getSnapshot().context.createdTestId).toBe(fakeTest.id)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [createUrl, createOptions] = fetchMock.mock.calls[1]
    expect(String(createUrl)).toContain('/tests')
    expect(createOptions?.method).toBe('POST')
    expect(JSON.parse(createOptions?.body as string)).toEqual(input)
  })
})
