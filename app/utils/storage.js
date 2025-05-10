import connectDB from './mongoose';
import ProofRequest from '../models/ProofRequest';

export async function storeProofRequest(uuid, proofRequest) {
  try {
    await connectDB();
    
    const newProofRequest = new ProofRequest({
      id: uuid,
      proofRequest,
      targetEmail: proofRequest.targetEmail,
      senderEmail: proofRequest.senderEmail,
      message: proofRequest.message,
      verificationType: proofRequest.verificationType,
      providerId: proofRequest.providerId,
    });

    await newProofRequest.save();
    return true;
  } catch (error) {
    console.error('Error storing proof request:', error);
    throw error;
  }
}

export async function getProofRequest(uuid) {
  try {
    await connectDB();
    
    const proofRequest = await ProofRequest.findOne({ id: uuid });
    return proofRequest;
  } catch (error) {
    console.error('Error retrieving proof request:', error);
    throw error;
  }
} 