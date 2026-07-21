import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'
import type { Preview } from '@storybook/tanstack-react'
import { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../src/i18n/config'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <Suspense fallback={null}>
        <I18nextProvider i18n={i18n}>
          <MantineProvider>
            <Story />
          </MantineProvider>
        </I18nextProvider>
      </Suspense>
    ),
  ],
}

export default preview
