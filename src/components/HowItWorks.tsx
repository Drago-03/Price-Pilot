import React from 'react';

const steps = [
  {
    title: "1. Location Input",
    description: "Enter your pickup and destination locations using our intuitive search interface. We support address autocomplete and current location detection for faster input.",
    icon: (
      <svg className="w-12 h-12 text-indigo-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: "2. Real-time Price Fetching",
    description: "Our system simultaneously queries multiple ride-hailing APIs (Uber, Ola, Rapido) to fetch current prices, surge rates, and estimated arrival times.",
    icon: (
      <svg className="w-12 h-12 text-indigo-400 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: "3. Smart Comparison",
    description: "We analyze and compare prices, ETAs, surge pricing, and driver availability across services. Our algorithm considers both cost and convenience factors.",
    icon: (
      <svg className="w-12 h-12 text-indigo-400 animate-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    title: "4. One-Click Booking",
    description: "Choose your preferred ride option and get redirected to the service provider's app with pre-filled trip details for seamless booking.",
    icon: (
      <svg className="w-12 h-12 text-indigo-400 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function HowItWorks() {
  return (
    <div className="glass-dark rounded-xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center mb-12 rainbow-text">How It Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, index) => (
          <div 
            key={step.title}
            className="gradient-border rounded-xl p-6 transform hover:scale-105 transition-all duration-300 animate-glow group"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg p-3 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all duration-300">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded animate-shimmer opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 gradient-border rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
        <p className="text-center text-lg text-gray-300 animate-pulse-slow">
          Compare prices instantly and save on your next ride!
        </p>
      </div>
    </div>
  );
} 