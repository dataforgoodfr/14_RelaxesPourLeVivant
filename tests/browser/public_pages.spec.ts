import { test } from '@japa/runner'

test.group('welcome page', () => {
  test('displays welcome page', async ({ visit }) => {
    const page = await visit('/welcome')
    await page.assertPath('/welcome')
  })

  test('has sign-in link', async ({ visit, assert }) => {
    const page = await visit('/welcome')
    const link = page.getByRole('link', { name: /Se connecter/i })
    const href = await link.getAttribute('href')
    assert.equal(href, '/sign-in')
  })

  test('has contribution link', async ({ visit, assert }) => {
    const page = await visit('/welcome')
    const link = page.getByRole('link', { name: /Contribuer/i })
    const href = await link.getAttribute('href')
    assert.equal(href, 'contribution')
  })
})

test.group('contribution page', () => {
  test('displays contribution page', async ({ visit }) => {
    const page = await visit('/contribution')
    await page.assertPath('/contribution')
  })
})

test.group('legal pages', () => {
  test('displays legal page', async ({ visit }) => {
    const page = await visit('/legal')
    await page.assertPath('/legal')
  })

  test('displays terms of use page', async ({ visit }) => {
    const page = await visit('/terms-of-use')
    await page.assertPath('/terms-of-use')
  })
})
