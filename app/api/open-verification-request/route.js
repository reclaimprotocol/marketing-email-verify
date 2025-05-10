import { NextResponse } from 'next/server';
import connectDB from '@/app/utils/mongoose';
import ProofRequest from '@/app/models/ProofRequest';


export async function GET(req) {
  try {
    await connectDB();

    // Get the ID from the URL search params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Proof ID is required' },
        { status: 400 }
      );
    }

    console.log('ID', id);
    const proofRequest = await ProofRequest.findOne({
      id
    });

    console.log('Proof request', proofRequest);
    
    if (!proofRequest) {
      return NextResponse.json(
        { error: 'Proof request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: proofRequest.id,
        targetEmail: proofRequest.targetEmail,
        senderEmail: proofRequest.senderEmail,
        message: proofRequest.message,
        verificationType: proofRequest.verificationType,
        createdAt: proofRequest.createdAt,
        proofRequest: proofRequest.proofRequest,
        verificationStatus: proofRequest.verificationStatus,
        verificationResult: (proofRequest.verificationResult && proofRequest.verificationResult.claimData)? JSON.parse(proofRequest.verificationResult.claimData.context)["extractedParameters"] : null,
        verifiedAt: proofRequest.verifiedAt
      }
    });
  } catch (error) {
    console.error('Error retrieving proof request:', error);
    return NextResponse.json(
      { error: 'Error retrieving proof request' },
      { status: 500 }
    );
  }
} 