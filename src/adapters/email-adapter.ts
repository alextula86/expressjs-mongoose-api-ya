import nodemailer from 'nodemailer'
import { isEmpty } from 'lodash'

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'a.marcuk2023@gmail.com',
        pass: 'suflbzalydymjqnt',
      },
    })

    try {
      const response = await transporter.sendMail({
        from: 'expressjs-video-api <a.marcuk2023@gmail.com>',
        to: email,
        subject: subject,
        html: message,
      })

      if (!isEmpty(response.rejected)) { throw response }

      // console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

      return response.messageId

    } catch (error) {
      console.log('nodemailer transporter error', error)
    }

    return null
  }
}