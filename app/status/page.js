'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const verificationTypes = {
  github: "GitHub username",
  yc: "YCombinator alumni status",
  accredited_investor: "Accredited investor status in USA",
  binance_kyc: "Binance KYC status",
  university: "University education",
  work: "Work history"
};

function StatusContent() {
  const [status, setStatus] = useState('loading');
  const [proofData, setProofData] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    async function fetchStatus() {
      if (!id) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/open-verification-request?id=${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch verification status');
        }

        setRequestDetails({
          senderEmail: data.data.senderEmail,
          targetEmail: data.data.targetEmail,
          verificationType: data.data.verificationType,
          message: data.data.message
        });

        console.log(data.data);
        
        if (data.data.verificationStatus === 'completed') {
          setStatus('completed');
          setProofData(data.data.verificationResult);
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        setStatus('error');
      }
    }

    fetchStatus();
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading status...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">Failed to load verification status</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          {status === 'completed' ? (
            <>
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Complete</h1>
              <p className="text-gray-600">The verification has been completed successfully</p>
            </>
          ) : (
            <>
              <div className="text-yellow-500 text-6xl mb-4">
                <svg className="animate-spin h-16 w-16 mx-auto" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Waiting for Verification</h1>
              <p className="text-gray-600">The user is yet to complete the verification process</p>
            </>
          )}
        </div>

        {requestDetails && (
          <div className="mt-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
                <p className="mt-1 text-sm text-gray-900">{requestDetails.senderEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Verification For</h3>
                <p className="mt-1 text-sm text-gray-900">{requestDetails.targetEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Verification Type</h3>
                <p className="mt-1 text-sm text-gray-900">{verificationTypes[requestDetails.verificationType]}</p>
              </div>
              {requestDetails.message && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Message</h3>
                  <p className="mt-1 text-sm text-gray-900">{requestDetails.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'completed' && proofData && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Details</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(proofData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Status() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
} 