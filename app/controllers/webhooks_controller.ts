import env from '#start/env'
import { userApprovedValidator } from '#validators/webhooks_validator'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class WebhooksController {
  async user({ request, response, logger }: HttpContext) {
    if (!request.header('X-Event-Name')) {
      return response.badRequest({ error: 'Missing X-Event-Name header' })
    }

    let payload
    try {
      payload = await userApprovedValidator.validate(request.body())
    } catch (err) {
      logger.error({ error: err, payload: request.body() }, 'Failed to process webhook')
      return response.badRequest({ error: 'Invalid payload' })
    }
    for (const user of payload.data.rows) {
      try {
        await mail.send((message) => {
          message
            .to(user.email)
            .from(env.get('ADMIN_EMAIL'))
            .subject('Votre demande a été approuvée')
            .htmlView('emails/user_approved')
        })
      } catch (err) {
        logger.error({ error: err, user }, 'Failed to send email')
      }
    }
  }
}
