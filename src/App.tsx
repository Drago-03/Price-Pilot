import React from 'react';
import Map from './components/Map';
import Contact from './components/Contact';
import Team from './components/Team';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated gradient background */}
      <div className="fixed inset-0 animate-gradient bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-50 pointer-events-none" />
      
      <div className="relative">
        <header className="glass-dark">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-float">
                <img 
                  src="/assets/images/logo.png" 
                  alt="Price Pilot Logo" 
                  className="h-24 w-auto hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-lg text-gray-300 italic text-center animate-pulse-slow">
                "Navigate your journey through the best prices"
              </p>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
          <div className="glass-dark rounded-xl shadow-2xl shadow-purple-500/20 p-6 hover:shadow-purple-500/30 transition-all duration-300">
            <div className="h-[600px]">
              <Map />
            </div>
          </div>

          <About />
          <Team />
          <HowItWorks />
          <Contact />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;