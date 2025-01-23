import { CheckIcon } from "lucide-react";
import React, { useState } from "react";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
  };

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800"
        alt="Newsletter Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Diagonal Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/95 via-secondary-800/90 to-transparent transform -skew-y-6 scale-110" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <div className="max-w-2xl text-center text-white">
          <span className="text-secondary-400 font-semibold mb-2 block">
            STAY UPDATED
          </span>
          <h2 className="text-4xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-300 mb-8">
            Join our subscriber list and be the first to know about new
            products, special offers, and exclusive deals.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 max-w-md px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm 
                          border border-white/20 text-white placeholder-gray-300
                          focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-secondary-500 text-white rounded-full 
                         hover:bg-secondary-600 transition-colors font-semibold"
              >
                Subscribe Now
              </button>
            </div>
          </form>

          <div className="mt-8 flex justify-center space-x-8 text-gray-300">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>Weekly Updates</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>Exclusive Offers</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>No Spam</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
