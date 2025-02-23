import React from 'react';

export default function Contact() {
  return (
    <div className="glass-dark rounded-xl shadow-2xl shadow-purple-500/20 p-8 hover:shadow-purple-500/30 transition-all duration-300">
      <h2 className="text-3xl font-bold text-center mb-12 rainbow-text">Contact Us</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="gradient-border rounded-xl p-6 animate-glow">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-400 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send us a Message
          </h3>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-300 mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-indigo-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-indigo-300 mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-indigo-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-indigo-300 mb-2" htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-indigo-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                placeholder="How can we help?"
              />
            </div>
            
            <div>
              <label className="block text-indigo-300 mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-indigo-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                placeholder="Your message..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 animate-shimmer"
            >
              Send Message
            </button>
          </form>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="gradient-border rounded-xl p-6 animate-glow group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Our Location
            </h3>
            <p className="text-gray-300 group-hover:text-white transition-colors duration-300">
              123 Innovation Street<br />
              Tech Hub, Digital City<br />
              Cyber State, 12345
            </p>
          </div>
          
          <div className="gradient-border rounded-xl p-6 animate-glow group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-400 animate-rotate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Business Hours
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="group-hover:text-white transition-colors duration-300">Monday - Friday: 9:00 AM - 6:00 PM</li>
              <li className="group-hover:text-white transition-colors duration-300">Saturday: 10:00 AM - 4:00 PM</li>
              <li className="group-hover:text-white transition-colors duration-300">Sunday: Closed</li>
            </ul>
          </div>
          
          <div className="gradient-border rounded-xl p-6 animate-glow group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-400 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Get in Touch
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="group-hover:text-white transition-colors duration-300">Phone: +1 (555) 123-4567</li>
              <li className="group-hover:text-white transition-colors duration-300">Email: contact@pricepilot.com</li>
              <li className="group-hover:text-white transition-colors duration-300">Support: support@pricepilot.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 