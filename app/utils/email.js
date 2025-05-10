import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendEmail({ to, subject, body, html }) {
  const params = {
    Source: `Bluecheck Verification <${process.env.SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: body,
          Charset: 'UTF-8',
        },
        ...(html && {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

