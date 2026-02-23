import env from '#start/env'

export class NocodbService {
  private readonly baseUrl = env.get('NC_API_URL')
  private readonly apiToken = env.get('NC_API_TOKEN')

  async fetchAttachmentFile(nocoDbPath: string) {
    return fetch(`${this.baseUrl}/${nocoDbPath}`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    })
  }
}
