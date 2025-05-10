'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

function OpenVerificationContent() {
  const [proofRequest, setProofRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [requestUrl, setRequestUrl] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [proofData, setProofData] = useState(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchProofRequest() {
      if (!id) {
        setError('No verification ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/open-verification-request?id=${id}`);
        const data = await response.json();
        console.log(data.data.proofRequest.proofRequest);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch verification request');
        }
        console.log(JSON.stringify(data.data.proofRequest.proofRequest));
        setProofRequest(data.data);
        const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(JSON.stringify(data.data.proofRequest.proofRequest));
        const requestUrl = await reclaimProofRequest.getRequestUrl();
        await reclaimProofRequest.startSession({
          onSuccess: (proof) => {
            console.log('Session started successfully');
            setVerificationStatus('success');
            setProofData(proof);
          },
          onError: (error) => {
            console.error('Error starting session:', error);
            setVerificationStatus('error');
          }
        });
        setRequestUrl(requestUrl);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProofRequest();
  }, [id]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading verification request...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!proofRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verification Request Not Found</h2>
          <p className="text-gray-600">The requested verification could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Verification Request
            </h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Request Details</h2>
                <dl className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Verification Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{proofRequest.verificationType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(proofRequest.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
                <dl className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{proofRequest.targetEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sender Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{proofRequest.senderEmail}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {proofRequest.message && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Message</h2>
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{proofRequest.message}</p>
                  </div>
                </div>
              )}

              {requestUrl && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Link</h2>
                  {verificationStatus === 'success' ? (
                    <div className="flex flex-col items-center">
                      <div className="text-green-500 text-6xl mb-4">✓</div>
                      <p className="text-gray-900 mb-4">Verification complete. Information has been shared with the sender</p>
                      {proofData && (
                        <pre className="bg-gray-100 p-4 rounded-lg w-full overflow-x-auto">
                          {JSON.stringify(proofData, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : verificationStatus === 'error' ? (
                    <div className="flex flex-col items-center">
                      <div className="text-red-500 text-6xl mb-4">✕</div>
                      <button
                        onClick={handleRetry}
                        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : isMobile ? (
                    <a
                      href={requestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open Verification
                    </a>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <QRCodeSVG
                          value={requestUrl}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        Scan this QR code with your mobile device to open the verification
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OpenVerification() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    }>
      <OpenVerificationContent />
    </Suspense>
  );
} 