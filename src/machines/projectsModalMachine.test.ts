import { createActor } from 'xstate'
import { describe, expect, it } from 'vitest'
import { projectsModalMachine } from './projectsModalMachine'

describe('projectsModalMachine — closed to open modes', () => {
  it('CREATE opens creating with the given entity type and no target', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'CREATE', entityType: 'project' })
    expect(actor.getSnapshot().matches('creating')).toBe(true)
    expect(actor.getSnapshot().context).toMatchObject({
      entityType: 'project',
      targetEntityId: null,
    })
  })

  it('EDIT opens editing with entity type and target id', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'EDIT', entityType: 'category', entityId: 'c1' })
    expect(actor.getSnapshot().matches('editing')).toBe(true)
    expect(actor.getSnapshot().context).toMatchObject({
      entityType: 'category',
      targetEntityId: 'c1',
    })
  })

  it('DELETE opens confirmingDelete with entity type and target id', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'DELETE', entityType: 'project', entityId: 'p1' })
    expect(actor.getSnapshot().matches('confirmingDelete')).toBe(true)
    expect(actor.getSnapshot().context).toMatchObject({
      entityType: 'project',
      targetEntityId: 'p1',
    })
  })
})

describe('projectsModalMachine — exclusivity', () => {
  it('cannot be in two modes at once: EDIT while creating is not reachable', () => {
    // The `on` handlers for CREATE/EDIT/DELETE only exist on `closed` —
    // sending EDIT while already in `creating` is simply ignored.
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'CREATE', entityType: 'project' })
    actor.send({ type: 'EDIT', entityType: 'category', entityId: 'c1' })
    expect(actor.getSnapshot().matches('creating')).toBe(true)
    expect(actor.getSnapshot().context.entityType).toBe('project')
  })

  it('closing resets context so no stale entity/error leaks into the next open', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'EDIT', entityType: 'project', entityId: 'p1' })
    actor.send({ type: 'SUBMIT', values: { name: 'x', description: '' } })
    actor.send({ type: 'MUTATION_ERROR', message: 'boom' })
    expect(actor.getSnapshot().context.error).toBe('boom')

    actor.send({ type: 'CANCEL' })
    expect(actor.getSnapshot().value).toBe('closed')
    expect(actor.getSnapshot().context).toEqual({
      entityType: null,
      targetEntityId: null,
      pendingValues: null,
      error: null,
    })
  })
})

describe('projectsModalMachine — create/edit submit flow', () => {
  it('SUBMIT moves to a nested submitting state, modal stays "open"', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'CREATE', entityType: 'project' })
    actor.send({ type: 'SUBMIT', values: { name: 'New project', description: '' } })
    expect(actor.getSnapshot().value).toEqual({ creating: 'submitting' })
    expect(actor.getSnapshot().matches('creating')).toBe(true)
  })

  it('MUTATION_SUCCESS from submitting closes the modal', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'CREATE', entityType: 'project' })
    actor.send({ type: 'SUBMIT', values: { name: 'New project', description: '' } })
    actor.send({ type: 'MUTATION_SUCCESS' })
    expect(actor.getSnapshot().value).toBe('closed')
  })

  it('MUTATION_ERROR from submitting returns to idle with the error, modal stays open', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'EDIT', entityType: 'category', entityId: 'c1' })
    actor.send({ type: 'SUBMIT', values: { name: 'Renamed', description: '' } })
    actor.send({ type: 'MUTATION_ERROR', message: 'Name already taken' })
    expect(actor.getSnapshot().value).toEqual({ editing: 'idle' })
    expect(actor.getSnapshot().matches('editing')).toBe(true)
    expect(actor.getSnapshot().context.error).toBe('Name already taken')
  })

  it('can retry SUBMIT after a failed attempt without losing the target entity', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'EDIT', entityType: 'project', entityId: 'p1' })
    actor.send({ type: 'SUBMIT', values: { name: 'A', description: '' } })
    actor.send({ type: 'MUTATION_ERROR', message: 'boom' })
    actor.send({ type: 'SUBMIT', values: { name: 'B', description: '' } })
    expect(actor.getSnapshot().value).toEqual({ editing: 'submitting' })
    expect(actor.getSnapshot().context.targetEntityId).toBe('p1')
    expect(actor.getSnapshot().context.pendingValues).toEqual({ name: 'B', description: '' })
  })
})

describe('projectsModalMachine — delete confirmation flow', () => {
  it('CONFIRM_DELETE moves to a nested submitting state', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'DELETE', entityType: 'project', entityId: 'p1' })
    actor.send({ type: 'CONFIRM_DELETE' })
    expect(actor.getSnapshot().value).toEqual({ confirmingDelete: 'submitting' })
  })

  it('MUTATION_SUCCESS closes the modal', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'DELETE', entityType: 'category', entityId: 'c1' })
    actor.send({ type: 'CONFIRM_DELETE' })
    actor.send({ type: 'MUTATION_SUCCESS' })
    expect(actor.getSnapshot().value).toBe('closed')
  })

  it('MUTATION_ERROR (e.g. entity still has tests) returns to confirmingDelete with the error', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'DELETE', entityType: 'project', entityId: 'p1' })
    actor.send({ type: 'CONFIRM_DELETE' })
    actor.send({ type: 'MUTATION_ERROR', message: 'This project still has tests' })
    expect(actor.getSnapshot().value).toEqual({ confirmingDelete: 'idle' })
    expect(actor.getSnapshot().context.error).toBe('This project still has tests')
  })

  it('CANCEL from confirmingDelete closes without deleting', () => {
    const actor = createActor(projectsModalMachine).start()
    actor.send({ type: 'DELETE', entityType: 'project', entityId: 'p1' })
    actor.send({ type: 'CANCEL' })
    expect(actor.getSnapshot().value).toBe('closed')
    expect(actor.getSnapshot().context.targetEntityId).toBeNull()
  })
})
