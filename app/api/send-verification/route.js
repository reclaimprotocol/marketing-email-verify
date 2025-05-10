import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { storeProofRequest } from '@/app/utils/storage';
import { sendEmail } from '@/app/utils/email';
const { ReclaimProofRequest, verifyProof } = require('@reclaimprotocol/js-sdk');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const providers = {
  github: "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
  yc: "a4c9fb77-6a4b-40ee-a850-98e4d41a89a6",
  accredited_investor: "3bfad093-4da8-44d6-a362-123750a70d40",
  binance_kyc: "2b22db5c-78d9-4d82-84f0-a9e0a4ed0470",
}

const verificationTypes = {
  github: "your GitHub username",
  yc: "if you are a Y Combinator alum",
  accredited_investor: "if you are an accredited investor in USA",
  binance_kyc: "if you are a Binance KYC'd user"
}

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    // Retrieve the checkout session to get the metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.metadata) {
      throw new Error('No metadata found in session');
    }

    const { targetEmail, senderEmail, message, verificationType } = session.metadata;
    console.log(targetEmail, senderEmail, message, verificationType);

    // Here you would implement your verification logic based on verificationType
    if(providers[verificationType]) {

      // Generate a unique ID for this proof request
      const proofId = uuidv4();

      console.log(process.env.RECLAIM_APPLICATION_ID, process.env.RECLAIM_SECRET, providers[verificationType]);
      const proofRequest = await ReclaimProofRequest.init(process.env.RECLAIM_APPLICATION_ID, process.env.RECLAIM_SECRET, "6d3f6753-7ee6-49ee-a545-62f1b1822ae5");
      proofRequest.addContext("0x0", proofId);
      proofRequest.setAppCallbackUrl(process.env.NEXT_PUBLIC_BASE_URL + "/api/reclaim-callback");
      console.log(proofRequest);
      
      // Store the proof request
      await storeProofRequest(proofId, {
        proofRequest,
        targetEmail,
        senderEmail,
        message,
        verificationType,
        createdAt: new Date().toISOString()
      });

      const verificationRequestEmailHtml = `
      <div style="max-width: 600px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background-color: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem;">
          <h1 style="text-align: center; font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 2rem;">
            Verification Request
          </h1>
  
          <div style="margin-bottom: 1.5rem;">
            <p> ${senderEmail} is requesting to verify ${verificationTypes[verificationType]}.</p>
          </div>
  
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 1rem;">
              Message
            </h2>
            <div style="background-color: #F9FAFB; padding: 1rem; border-radius: 0.5rem;">
              <p style="margin: 0; color: #374151;">${message}</p>
            </div>
          </div>
  
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/open?id=${proofId}" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.2s;">
              Verify Now
            </a>
            <p>
              <br>
              <small style="color: #6B7280;">This verification is powered by <a href="https://thebluecheck.com">Bluecheck</a> and <a href="https://reclaimprotocol.org">Reclaim Protocol</a></small>
            </p>
          </div>
        </div>
      </div>
      `;
  
      // Send email to target
      await sendEmail({
        to: targetEmail,
        subject: 'Verification Request',
        body: `${senderEmail} is requesting to verify ${verificationTypes[verificationType]}.\n\nMessage from the requester: ${message}\n\nPlease click the link below to verify:\n${process.env.NEXT_PUBLIC_BASE_URL}/open?id=${proofId}`,
        html: verificationRequestEmailHtml
      });
  
      // Send confirmation email to sender
      const verificationSentEmailHtml = `
          <div style="max-width: 600px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
        <div style="background-color: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem;">
          <h1 style="text-align: center; font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 2rem;">
            Verification Request Sent
          </h1>
  
          <div style="margin-bottom: 1.5rem;">
            <p> ${targetEmail} has been requested to verify ${verificationTypes[verificationType]}. You will receive an email once they complete the verification.</p>
          </div>
  
          <div style="margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 1rem;">
              Message
            </h2>
            <div style="background-color: #F9FAFB; padding: 1rem; border-radius: 0.5rem;">
              <p style="margin: 0; color: #374151;">${message}</p>
            </div>
          </div>
  
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/status?id=${proofId}" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: background-color 0.2s;">
              Check Status
            </a>
            <p>
              <br>
              <small style="color: #6B7280;">This verification is powered by <a href="https://thebluecheck.com">Bluecheck</a> and <a href="https://reclaimprotocol.org">Reclaim Protocol</a></small>
            </p>
          </div>
        </div>
      </div>
      `
      
      await sendEmail({
        to: senderEmail,
        subject: 'Verification Request Submitted',
        body: 'Your verification request has been submitted successfully. We will notify you once the verification is complete.',
        html: verificationSentEmailHtml
      });
  
      return NextResponse.json({ 
        success: true,
        message: 'Verification request received',
        proofId
      });
    }
    else {
      throw new Error('Invalid verification type');
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error processing verification request' },
      { status: 500 }
    );
  }
} 