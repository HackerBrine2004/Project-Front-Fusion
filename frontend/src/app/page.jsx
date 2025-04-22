"use client";
import React from "react";
import Aurora from "@/components/Aurora";
import Particles from "@/components/Particles";
import FeatureGrid from "@/components/Featuregrid";
import Promptbar from "@/components/Promptbar";
import GradientText from "@/components/Gradienttext";
import Navbar from "@/components/Navbar";
import TerminalSection from "@/components/TerminalAdd";

const Home = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-screen">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={20000}
          particleSpread={40}
          speed={0.06}
          particleBaseSize={60}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Floating Purple Border Box */}
      <div className="relative w-full mt-3 sm:mt-2  h-screen flex justify-center items-center">
        {/* Floating border element (positioned absolutely) */}
        <div className="absolute inset-2 border-6 border-purple-500 rounded-xl mx-4 sm:mx-10 shadow-[0_0_20px_5px_rgba(168,85,247,0.3)] animate-float" 
             style={{
               margin: '5rem',
               pointerEvents: 'none'
             }}></div>
        
        {/* Stable Content Container (not affected by float) */}
        <div className="relative z-10 p-8 mx-4 sm:mx-10 backdrop-blur-sm bg-black/30 rounded-lg">
          {/* Hero Section */}
          <div className="w-full flex flex-col justify-center mt-15 items-center text-center">
            <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              »»Code Faster. Customize More. Build Better.««
            </h1>

            <div className="mt-6 mb-8 text-2xl sm:text-2xl leading-tight md:text-5xl text-white/90">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Frontend Development Made Easy!
              </GradientText>
            </div>
            
            <div className="mb-6 mt-6 sm:mt-6 flex sm:flex-row flex-col md:flex-row gap-4 md:gap-8">
              <Promptbar />
            </div>
          </div>
        </div>
      </div>

      <TerminalSection />
      
      {/* Feature Grid Section */}
      <FeatureGrid />
    </div>
  );
};

export default Home;