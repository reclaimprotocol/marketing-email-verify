import mongoose from 'mongoose';

const proofRequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  proofRequest: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  targetEmail: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  verificationType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  verificationResult: {
    type: mongoose.Schema.Types.Mixed,
  },
  verifiedAt: {
    type: Date,
  },
});

// Create indexes
proofRequestSchema.index({ id: 1 });
proofRequestSchema.index({ createdAt: -1 });
proofRequestSchema.index({ 'proofRequest.sessionId': 1 });
proofRequestSchema.index({ verificationStatus: 1 });

export default mongoose.models.ProofRequest || mongoose.model('ProofRequest', proofRequestSchema); 