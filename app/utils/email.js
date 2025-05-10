import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Validate required environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}. Please add them to your environment configuration.`
  );
}

// Log the region being used (but not the credentials)
console.log('Using AWS Region:', process.env.AWS_REGION);

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendEmail({ to, subject, body, html }) {
  if (!to || !subject || (!body && !html)) {
    throw new Error('Missing required email parameters: to, subject, and either body or html are required');
  }

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
          Data: body || '',
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
    
    // Log more detailed error information
    console.error('Error details:', {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      requestId: error.$metadata?.requestId,
      region: process.env.AWS_REGION,
    });

    // Handle specific AWS credential errors
    if (error.name === 'InvalidSignatureException' || error.message.includes('security token')) {
      throw new Error(
        `${process.env.AWS_REGION} : AWS credentials are invalid. Please check your AWS_ACCESS_KEY_ID (${process.env.AWS_ACCESS_KEY_ID.substring(0, 3)}...) and AWS_SECRET_ACCESS_KEY (${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 3)}...) in your environment variables.`
      );
    }

    if (error.name === 'AccessDeniedException') {
      throw new Error(
        `${process.env.AWS_REGION} : AWS credentials do not have permission to send emails. Please ensure your IAM user has SES permissions.`
      );
    }

    if (error.name === 'InvalidClientTokenId') {
      throw new Error(
        `${process.env.AWS_REGION} : Invalid AWS Access Key ID (${process.env.AWS_ACCESS_KEY_ID.substring(0, 3)}...). Please check your AWS_ACCESS_KEY_ID in your environment variables.`
      );
    }

    throw new Error(`Failed to send email: ${error.message} | region: ${process.env.AWS_REGION}, ${process.env.AWS_ACCESS_KEY_ID.substring(0, 3)}..., ${process.env.AWS_SECRET_ACCESS_KEY.substring(0, 3)}...`);
  }
}

