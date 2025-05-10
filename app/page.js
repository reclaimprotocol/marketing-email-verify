'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Home() {
  const [formData, setFormData] = useState({
    targetEmail: '',
    senderEmail: '',
    message: '',
    verificationType: 'github'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const session = await response.json();
      
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/emailverify.png"
              alt="EmailVerify Logo"
              width={200}
              height={80}
              className="h-20 w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* How it Works Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bluecheck Verification over Email</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Enter Details</h3>
                  <p className="mt-2 text-gray-600">
                    Provide the email address of the person you want to verify and what you want to verify about them.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Secure Payment</h3>
                  <p className="mt-2 text-gray-600">
                    Complete a secure payment to initiate the verification process.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Verification Request</h3>
                  <p className="mt-2 text-gray-600">
                    We'll send a secure verification request to the person you want to verify.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    4
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Get Results</h3>
                  <p className="mt-2 text-gray-600">
                    Once verified, you'll receive the results directly to your email.
                  </p>
                </div>
              </div>
              <small className="text-gray-500">Powered by <a href="https://thebluecheck.com" target="_blank" rel="noopener noreferrer"> Bluecheck</a></small>

            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Start Verification</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md space-y-4">
                <div>
                  <label htmlFor="targetEmail" className="block text-sm font-medium text-gray-700">
                    Whom do you want to verify?
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide personal email address, we will send instructions on this email
                  </p>
                  <input
                    id="targetEmail"
                    name="targetEmail"
                    type="email"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={formData.targetEmail}
                    onChange={(e) => setFormData({...formData, targetEmail: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">
                    What is your email address?
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    We will send the verified data to you after the user completes the verification
                  </p>
                  <input
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({...formData, senderEmail: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Add a message to be sent
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="verificationType" className="block text-sm font-medium text-gray-700">
                    What do you want to verify
                  </label>
                  <select
                    id="verificationType"
                    name="verificationType"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={formData.verificationType}
                    onChange={(e) => setFormData({...formData, verificationType: e.target.value})}
                  >
                    <option value="github">What is their GitHub username?</option>
                    <option value="yc">Are they a YCombinator alum?</option>
                    <option value="accredited_investor">Are they an accredited investor in USA?</option>
                    <option value="binance_kyc">Are they a Binance KYC'd user?</option>
                    <option disabled value="university">Which university did they go to?</option>
                    <option disabled value="work">Where do they work?</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
