'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify credentials
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
