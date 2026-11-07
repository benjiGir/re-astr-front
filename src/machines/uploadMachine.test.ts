import { createActor, fromPromise, waitFor } from 'xstate'
import { describe, expect, it } from 'vitest'
import { MAX_FILES, uploadMachine, validateFiles } from './uploadMachine'
import type { CreateTestDto, Test } from '../api/schemas/test.schema'

function file(name = 'a.txt', size = 1024): File {
  return new File(['x'.repeat(size)], name)
}

const testInput: CreateTestDto = {
  projectId: 'p1',
  categoryId: 'c1',
  name: 'My test',
  commonData: {},
}

const testOutput: Test = {
  id: 't1',
  projectId: 'p1',
  categoryId: 'c1',
  name: 'My test',
  status: 'draft',
  commonData: {},
  customData: {},
  createdBy: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('validateFiles', () => {
  it('rejects an empty file list', () => {
    expect(validateFiles([])).not.toEqual([])
  })

  it('rejects more than MAX_FILES files', () => {
    const files = Array.from({ length: MAX_FILES + 1 }, (_, i) => file(`f${i}.txt`))
    expect(validateFiles(files)).not.toEqual([])
  })

  it('accepts a small, single file', () => {
    expect(validateFiles([file()])).toEqual([])
  })
})

describe('uploadMachine — idle to collectingMetadata', () => {
  it('idle --FILES_SELECTED(valid)--> collectingMetadata (via validatingFiles)', () => {
    const actor = createActor(uploadMachine).start()
    actor.send({ type: 'FILES_SELECTED', files: [file()] })
    expect(actor.getSnapshot().value).toEqual({ collecting: 'collectingMetadata' })
    expect(actor.getSnapshot().context.issues).toEqual([])
  })

  it('idle --FILES_SELECTED(invalid)--> back to idle with issues', () => {
    const actor = createActor(uploadMachine).start()
    actor.send({ type: 'FILES_SELECTED', files: [] })
    expect(actor.getSnapshot().value).toEqual({ collecting: 'idle' })
    expect(actor.getSnapshot().context.issues.length).toBeGreaterThan(0)
  })
})

describe('uploadMachine — PROJECT_SELECTED/CATEGORY_SELECTED work regardless of child state', () => {
  // Bug found live: these were only wired on collectingMetadata/
  // fillingDynamicFields, so picking a project/category before dropping any
  // file (perfectly natural UI order — nothing in the form forces files
  // first) was silently dropped, and the category's specific fields never
  // appeared. Now hoisted onto the shared `collecting` parent so every
  // child state gets them for free — this test guards the regression at
  // the state most likely to be forgotten again: `idle`.
  it('PROJECT_SELECTED from idle (no files yet) is not dropped', () => {
    const actor = createActor(uploadMachine).start()
    actor.send({ type: 'PROJECT_SELECTED', projectId: 'p1' })
    expect(actor.getSnapshot().context.selectedProjectId).toBe('p1')
    expect(actor.getSnapshot().value).toEqual({ collecting: 'idle' })
  })

  it('CATEGORY_SELECTED from idle (no files yet) starts loading the category', () => {
    const actor = createActor(uploadMachine).start()
    actor.send({ type: 'CATEGORY_SELECTED', categoryId: 'c1' })
    expect(actor.getSnapshot().context.selectedCategoryId).toBe('c1')
    expect(actor.getSnapshot().value).toEqual({ collecting: 'loadingCategorySchema' })
  })
})

describe('uploadMachine — category loading', () => {
  function withMockedCategoryLoad(shouldSucceed: boolean) {
    return uploadMachine.provide({
      actors: {
        warmCategoryCache: fromPromise(() =>
          shouldSucceed ? Promise.resolve() : Promise.reject(new Error('boom')),
        ),
      },
    })
  }

  it('collectingMetadata --CATEGORY_SELECTED--> fillingDynamicFields on success', async () => {
    const actor = createActor(withMockedCategoryLoad(true)).start()
    actor.send({ type: 'FILES_SELECTED', files: [file()] })
    actor.send({ type: 'CATEGORY_SELECTED', categoryId: 'c1' })
    expect(actor.getSnapshot().value).toEqual({ collecting: 'loadingCategorySchema' })

    await waitFor(actor, (s) => s.matches({ collecting: 'fillingDynamicFields' }), {
      timeout: 1000,
    })
    expect(actor.getSnapshot().context.selectedCategoryId).toBe('c1')
  })

  it('loadingCategorySchema --error--> back to collectingMetadata with an issue', async () => {
    const actor = createActor(withMockedCategoryLoad(false)).start()
    actor.send({ type: 'FILES_SELECTED', files: [file()] })
    actor.send({ type: 'CATEGORY_SELECTED', categoryId: 'c1' })

    await waitFor(actor, (s) => s.matches({ collecting: 'collectingMetadata' }), {
      timeout: 1000,
    })
    expect(actor.getSnapshot().context.issues.length).toBeGreaterThan(0)
  })
})

describe('uploadMachine — submission and retry', () => {
  function machineWithCreateTest(impl: () => Promise<Test>) {
    return uploadMachine.provide({
      actors: {
        warmCategoryCache: fromPromise(() => Promise.resolve()),
        createTest: fromPromise(impl),
      },
    })
  }

  async function toFillingDynamicFields(machine: typeof uploadMachine) {
    const actor = createActor(machine).start()
    actor.send({ type: 'FILES_SELECTED', files: [file()] })
    actor.send({ type: 'CATEGORY_SELECTED', categoryId: 'c1' })
    await waitFor(actor, (s) => s.matches({ collecting: 'fillingDynamicFields' }), {
      timeout: 1000,
    })
    return actor
  }

  it('fillingDynamicFields --SUBMIT--> success on a successful create', async () => {
    const actor = await toFillingDynamicFields(
      machineWithCreateTest(() => Promise.resolve(testOutput)),
    )
    actor.send({ type: 'SUBMIT', input: testInput })
    expect(actor.getSnapshot().value).toBe('submitting')

    await waitFor(actor, (s) => s.value === 'success', { timeout: 1000 })
  })

  it('submitFailed --RETRY--> submitting --> submitFailed again on repeated failure', async () => {
    const actor = await toFillingDynamicFields(
      machineWithCreateTest(() => Promise.reject(new Error('network down'))),
    )
    actor.send({ type: 'SUBMIT', input: testInput })
    await waitFor(actor, (s) => s.value === 'submitFailed', { timeout: 1000 })
    expect(actor.getSnapshot().context.retries).toBe(0)

    actor.send({ type: 'RETRY' })
    expect(actor.getSnapshot().value).toBe('submitting')
    await waitFor(actor, (s) => s.value === 'submitFailed', { timeout: 1000 })
    expect(actor.getSnapshot().context.retries).toBe(1)
  })

  it('blocks retrying past the 3rd attempt (canRetry guard)', async () => {
    const actor = await toFillingDynamicFields(
      machineWithCreateTest(() => Promise.reject(new Error('network down'))),
    )
    actor.send({ type: 'SUBMIT', input: testInput })
    await waitFor(actor, (s) => s.value === 'submitFailed', { timeout: 1000 })

    for (let i = 0; i < 3; i++) {
      actor.send({ type: 'RETRY' })
      await waitFor(actor, (s) => s.value === 'submitFailed', { timeout: 1000 })
    }
    expect(actor.getSnapshot().context.retries).toBe(3)

    actor.send({ type: 'RETRY' })
    // Guard blocks the 4th retry — state and retry count stay put.
    expect(actor.getSnapshot().value).toBe('submitFailed')
    expect(actor.getSnapshot().context.retries).toBe(3)
  })

  it('submitFailed --CANCEL--> fillingDynamicFields', async () => {
    const actor = await toFillingDynamicFields(
      machineWithCreateTest(() => Promise.reject(new Error('network down'))),
    )
    actor.send({ type: 'SUBMIT', input: testInput })
    await waitFor(actor, (s) => s.value === 'submitFailed', { timeout: 1000 })

    actor.send({ type: 'CANCEL' })
    expect(actor.getSnapshot().value).toEqual({ collecting: 'fillingDynamicFields' })
  })
})
