import env from '#start/env'

export class NocodbService {
  private readonly baseUrl = env.get('NC_API_URL')

  async fetchAttachmentFile(nocoDbPath: string) {
    return fetch(`${this.baseUrl}/${nocoDbPath}`)
  }
}
