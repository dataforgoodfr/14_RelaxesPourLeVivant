import type { HttpContext } from '@adonisjs/core/http'

export default class WebhooksController {
  async user({ request, response }: HttpContext) {
    console.log(
      'Received webhook with event name:',
      request.header('X-Event-Name'),
      'and payload:',
      request.body()
    )
    if (!request.header('X-Event-Name')) {
      return response.badRequest({ error: 'Missing X-Event-Name header' })
    }
  }
}
