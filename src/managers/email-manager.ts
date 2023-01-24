import { emailAdapter } from "../adapters"

export const emailManager = {
  async sendEmailCreatedUser(email: string, code: string) {
    const message = `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
        <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
      </p>
      `
    const subject = 'Подтверждение регистрации' 

    const messageId: string | null = await emailAdapter.sendEmail(email, subject, message)

    if (!messageId) {
      return false
    }

    return true
  }
}
