import React from 'react';

export default function About() {
  return (
    <div className="glass-dark rounded-xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-300">
      <h2 className="text-2xl font-semibold text-white text-center mb-8">About Price Pilot</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Our Mission
          </h3>
          <p className="text-gray-300">
            Price Pilot is your trusted companion for comparing prices across food delivery and cab services. 
            We empower users to make informed decisions by providing real-time price comparisons, helping you 
            save both time and money.
          </p>
        </div>

        {/* What Makes Us Stand Out */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            What Makes Us Stand Out
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Real-time price aggregation across multiple platforms
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Transparent comparison without hidden fees
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              User-friendly interface for quick decisions
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Privacy-focused with no data collection
            </li>
          </ul>
        </div>

        {/* How We Work */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            How We Work
          </h3>
          <p className="text-gray-300 mb-4">
            Price Pilot operates as a price comparison tool that aggregates publicly available pricing information. 
            We don't store personal data or process payments. Instead, we:
          </p>
          <ul className="space-y-2 text-gray-300">
            {[
              "Fetch real-time prices from service providers",
              "Display transparent comparisons",
              "Redirect you to official platforms for booking",
              "Ensure your data privacy and security"
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Compliance */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Legal Compliance
          </h3>
          <ul className="space-y-2 text-gray-300">
            {[
              "No unauthorized data collection or storage",
              "Compliance with price comparison regulations",
              "Transparent disclosure of information sources",
              "Regular security audits"
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Open Source */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Why We're Open Source
          </h3>
          <p className="text-gray-300 mb-4">
            Price Pilot is proudly open source, meaning our code is freely available for anyone to view, use, 
            or contribute to. This approach:
          </p>
          <ul className="space-y-2 text-gray-300 mb-6">
            {[
              "Ensures transparency in how we operate",
              "Allows community contributions and improvements",
              "Promotes innovation and knowledge sharing",
              "Builds trust through code visibility"
            ].map((item, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-300 font-medium mb-4">
              <span className="font-bold text-indigo-300">What is Open Source?</span> Open source software has its source code 
              freely available for anyone to view, modify, and enhance. This collaborative approach leads to 
              more secure, reliable, and innovative software through community participation.
            </p>
            <a
              href="https://github.com/Drago-03/Price-Pilot.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Our Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 