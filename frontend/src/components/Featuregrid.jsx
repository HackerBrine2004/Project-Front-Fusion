"use client";
import React from "react";
import Particles from "@/components/Particles";
import Squares from "./Cards";

const features = [
  { title: "🚀 Fast Performance", description: "Optimized for speed and efficiency.", glow: "hover:shadow-md hover:shadow-red-500" },
  { title: "🤖 AI-Powered", description: "Leverage AI for smarter workflows.", glow: "hover:shadow-md hover:shadow-green-500" },
  { title: "🔗 Easy Integration", description: "Seamless setup with existing projects.", glow: "hover:shadow-md hover:shadow-blue-500" },
  { title: "📱 Responsive Design", description: "Perfect on all devices and screen sizes.", glow: "hover:shadow-md hover:shadow-purple-500" },
  { title: "🎨 Customizable", description: "Modify and adapt to your needs effortlessly.", glow: "hover:shadow-md hover:shadow-cyan-500" },
  { title: "🔒 Secure & Reliable", description: "Built with top-notch security features.", glow: "hover:shadow-md hover:shadow-yellow-500" },
  { title: "📊 Real-time Analytics", description: "Monitor performance with real-time insights.", glow: "hover:shadow-md hover:shadow-orange-500" },
  { title: "⚡ Lightning Speed", description: "Ultra-fast processing with minimal latency.", glow: "hover:shadow-md hover:shadow-indigo-500" },
  { title: "🛠️ Developer Friendly", description: "Built with clean and modular code.", glow: "hover:shadow-md hover:shadow-lime-500" }
];

const FeatureGrid = () => {
  return (
    <section className="relative py-25 px-6 md:px-20 bg-black text-white text-center overflow-hidden">
      {/* Optimized Purple Line (Static Position, No Reflows) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500"></div>

      {/* Squares Effect*/}
      <div className="absolute inset-0">
        <Squares 
          speed={0.1}  /* Lower Speed */
          squareSize={50} /* Smaller Square Size */
          direction="diagonal"
          borderColor="#36dcf2"
          hoverFillColor="#222"
        />
      </div>

      {/* Features Section Content */}
      <div className="relative z-10 container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          Why Choose <span className="text-violet-400">Front-Fusion?</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`p-6 bg-black bg-opacity-40 rounded-xl border border-white/20 transition-transform duration-300
              ${feature.glow} hover:scale-105 will-change-transform`}
            >
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
