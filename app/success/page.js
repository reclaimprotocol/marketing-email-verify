'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Success() {
  const [status, setStatus] = useState('loading');
  const [proofId, setProofId] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Send the verification request
      fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setStatus('success');
            setProofId(data.proofId);
          } else {
            setStatus('error');
          }
        })
        .catch(() => {
          setStatus('error');
        });
    }
  }, [sessionId]);

  const handleShare = async () => {
    const verificationUrl = `${window.location.origin}/open?id=${proofId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Verification Request',
          text: 'Please verify my credentials using this link',
          url: verificationUrl,
        });
        setShareStatus('success');
      } else {
        await navigator.clipboard.writeText(verificationUrl);
        setShareStatus('copied');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setShareStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Processing your request...</h2>
            <p>Please wait while we process your verification request.</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Success!</h2>
            <p>Your verification request has been sent to the recipient. You can share link manually too, using the button below.</p>
            <p className="mt-4">You will receive an email once the recipient completes the verification. You can check the status using the button below.</p>
            {proofId && (
              <div className="mt-6 space-y-4">
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href={`/status?id=${proofId}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Check Status
                  </Link>
                  <button
                    onClick={handleShare}
                    className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {shareStatus === 'copied' ? 'Link Copied!' : 'Share Link'}
                  </button>
                </div>
                {shareStatus === 'error' && (
                  <p className="text-sm text-red-600">Failed to share link. Please try again.</p>
                )}
              </div>
            )}
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p>There was an error processing your request.</p>
            <p className="mt-4">Please contact support for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
} 