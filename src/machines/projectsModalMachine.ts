import { assign, setup } from 'xstate'
import type { EntityFormValues } from '../components/ProjectsCategories/EntityFormModal'

export type EntityType = 'project' | 'category'

/**
 * R1: the machine holds an entity *type* and *ID*, never the `Project`/
 * `Category` object itself — that stays in React Query. `pendingValues` is a
 * one-shot snapshot of the RHF-validated form payload taken at SUBMIT time
 * (R2 — RHF owns the field values), used to drive the mutation call.
 */
export interface ProjectsModalContext {
  entityType: EntityType | null
  targetEntityId: string | null
  pendingValues: EntityFormValues | null
  error: string | null
}

export type ProjectsModalEvent =
  | { type: 'CREATE'; entityType: EntityType }
  | { type: 'EDIT'; entityType: EntityType; entityId: string }
  | { type: 'DELETE'; entityType: EntityType; entityId: string }
  | { type: 'CANCEL' }
  | { type: 'SUBMIT'; values: EntityFormValues }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'MUTATION_SUCCESS' }
  | { type: 'MUTATION_ERROR'; message: string }

export const projectsModalMachine = setup({
  types: {} as {
    context: ProjectsModalContext
    events: ProjectsModalEvent
  },
}).createMachine({
  id: 'projectsModal',
  initial: 'closed',
  context: {
    entityType: null,
    targetEntityId: null,
    pendingValues: null,
    error: null,
  },
  states: {
    // `#closed`: nested states below target it by id, not by relative path.
    closed: {
      id: 'closed',
      entry: assign({
        entityType: null,
        targetEntityId: null,
        pendingValues: null,
        error: null,
      }),
      on: {
        CREATE: {
          target: 'creating',
          actions: assign({ entityType: ({ event }) => event.entityType, targetEntityId: null }),
        },
        EDIT: {
          target: 'editing',
          actions: assign({
            entityType: ({ event }) => event.entityType,
            targetEntityId: ({ event }) => event.entityId,
          }),
        },
        DELETE: {
          target: 'confirmingDelete',
          actions: assign({
            entityType: ({ event }) => event.entityType,
            targetEntityId: ({ event }) => event.entityId,
          }),
        },
      },
    },
    // `creating`/`editing` nest an idle/submitting pair so the modal stays
    // open (matches('creating') is true in both) while a mutation is in
    // flight, without a second "isSubmitting" boolean that could drift.
    creating: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            CANCEL: '#closed',
            SUBMIT: {
              target: 'submitting',
              actions: assign({ pendingValues: ({ event }) => event.values, error: null }),
            },
          },
        },
        submitting: {
          on: {
            MUTATION_SUCCESS: '#closed',
            MUTATION_ERROR: {
              target: 'idle',
              actions: assign({ error: ({ event }) => event.message }),
            },
          },
        },
      },
    },
    editing: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            CANCEL: '#closed',
            SUBMIT: {
              target: 'submitting',
              actions: assign({ pendingValues: ({ event }) => event.values, error: null }),
            },
          },
        },
        submitting: {
          on: {
            MUTATION_SUCCESS: '#closed',
            MUTATION_ERROR: {
              target: 'idle',
              actions: assign({ error: ({ event }) => event.message }),
            },
          },
        },
      },
    },
    confirmingDelete: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            CANCEL: '#closed',
            CONFIRM_DELETE: 'submitting',
          },
        },
        submitting: {
          on: {
            MUTATION_SUCCESS: '#closed',
            MUTATION_ERROR: {
              target: 'idle',
              actions: assign({ error: ({ event }) => event.message }),
            },
          },
        },
      },
    },
  },
})
