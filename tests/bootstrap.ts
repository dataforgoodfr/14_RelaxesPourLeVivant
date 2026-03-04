import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import env from '#start/env'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  browserClient({ runInSuites: ['browser'] }),
  sessionBrowserClient(app),
  authBrowserClient(app),
  shieldApiClient(),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite
      .setup(() => startPostgres())
      .setup(() => testUtils.db().migrate())
      .setup(() => testUtils.httpServer().start())
  }
}

async function startPostgres() {
  const postgres = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase(env.get('DB_DATABASE'))
    .withUsername(env.get('DB_USER'))
    .withPassword(env.get('DB_PASSWORD')!)
    .withExposedPorts({
      container: 5432,
      host: env.get('DB_PORT'),
    })
    .start()
  return async () => {
    await postgres.stop()
  }
}
