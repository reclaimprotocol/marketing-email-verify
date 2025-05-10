import { NextResponse } from 'next/server';
import { verifyProof } from '@reclaimprotocol/js-sdk';
import connectDB from '@/app/utils/mongoose';
import ProofRequest from '@/app/models/ProofRequest';

export async function POST(req) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    console.log('Received form data:', Object.fromEntries(formData));

    // Convert form data to an object
    const body = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    console.log('Processed body:', body);

    const parsedBody = JSON.parse(Object.keys(body)[0]);

    // Verify the proof
    const isValid = await verifyProof(parsedBody);
    if (!isValid) {
      console.error('Invalid proof received');
      return NextResponse.json(
        { error: 'Invalid proof' },
        { status: 400 }
      );
    }

    await connectDB();

    const id = JSON.parse(parsedBody.claimData.context)["contextMessage"];
    console.log('ID', id);
    console.log('Claim data', parsedBody);
    // Find the proof request by session ID
    const proofRequest = await ProofRequest.findOne({
      id
    });

    if (!proofRequest) {
      console.error('Proof request not found for id:', id);
      return NextResponse.json(
        { error: 'Proof request not found' },
        { status: 404 }
      );
    }

    // Update the proof request with the verification result
    proofRequest.verificationStatus = 'completed';
    proofRequest.verificationResult = parsedBody;
    proofRequest.verifiedAt = new Date();
    await proofRequest.save();
    console.log('Proof request updated with verification result', proofRequest);

    const extractedParameters = JSON.parse(parsedBody.claimData.context)["extractedParams"];
    console.log('Extracted parameters', extractedParameters);


    const verificationResultEmailHtml = `
    <div style="max-width: 600px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background-color: white; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem;">
        <h1 style="text-align: center; font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 2rem;">
          Verification Request
        </h1>

        <div style="margin-bottom: 1.5rem;">
          <p> ${proofRequest.targetEmail} has completed the verification.</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 1rem;">
            Message
          </h2>
          <div style="background-color: #F9FAFB; padding: 1rem; border-radius: 0.5rem;">
            <p style="margin: 0; color: #374151;">${proofRequest.message}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 2rem;">
          <pre>
            ${JSON.stringify(extractedParameters, null, 2)}
          </pre>
          <p>
            <br>
            <small style="color: #6B7280;">This verification is powered by <a href="https://thebluecheck.com">Bluecheck</a> and <a href="https://reclaimprotocol.org">Reclaim Protocol</a></small>
          </p>
        </div>
      </div>
    </div>
    `;

    // Send email to target
    /*await sendEmail({
      to: proofRequest.targetEmail,
      subject: 'Verification Request',
      body: `Verification request completed by ${proofRequest.senderEmail}, check the result here : ${process.env.NEXT_PUBLIC_BASE_URL}/status?id=${proofRequest.id}`,
      html: verificationResultEmailHtml
    });*/


    return NextResponse.json({
      success: true,
      message: 'Verification completed successfully'
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json(
      { error: 'Error processing verification callback' },
      { status: 500 }
    );
  }
} 