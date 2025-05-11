"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Aurora from "@/components/Aurora";
import Particles from "@/components/Particles";
import FeatureGrid from "@/components/Featuregrid";
import Promptbar from "@/components/Promptbar";
import GradientText from "@/components/Gradienttext";
import Navbar from "@/components/Navbar";
import TerminalSection from "@/components/TerminalAdd";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px 5px rgba(168,85,247,0.2)",
      "0 0 30px 8px rgba(168,85,247,0.4)",
      "0 0 20px 5px rgba(168,85,247,0.2)"
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Home = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-purple-950">
      {/* Background Effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-screen"
      >
        <Particles
          particleColors={["#ffffff", "#10b9ea", "#a855f7"]}
          particleCount={20000}
          particleSpread={40}
          speed={0.04}
          particleBaseSize={60}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={false}
        />
      </motion.div>

      {/* Accent Lines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative w-full mt-3 sm:mt-2 h-screen flex justify-center items-center">
        {/* Main Content */}
        <motion.div
          animate={glowPulse.animate}
          className="relative z-10 p-8 mx-4 sm:mx-10 rounded-xl border border-purple-500/30 backdrop-blur-sm bg-black/30"
        >
          {/* Hero Section */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="w-full flex flex-col justify-center mt-15 items-center text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <span className="mx-4 text-cyan-400 font-mono text-sm tracking-widest">PROJECT-FRONT-FUSION</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500 mb-4 leading-tight font-sans tracking-tight"
            >
              »»Code Faster. Customize More. Build Better.««
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="mt-6 mb-8 text-2xl sm:text-2xl leading-tight md:text-5xl text-white/90"
            >
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Frontend Development Made Easy!
              </GradientText>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mb-6 mt-6 sm:mt-6 flex sm:flex-row flex-col md:flex-row gap-4 md:gap-8"
            >
              <Promptbar />
            </motion.div>
            
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex justify-center space-x-6"
            >
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm">Real-time Editing</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm">Fully Customizable</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <TerminalSection />
      
      {/* Feature Grid Section */}
      <FeatureGrid />
    </div>
  );
};

export default Home;