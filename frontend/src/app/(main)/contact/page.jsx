import React from 'react';
import Aurora from '@/components/Aurora';  // Assuming Aurora component is already created
import TiltedCard from '@/components/Tiltcard';  // Assuming you already have this component
import Navbar from '@/components/Navbar';
import Particles from '@/components/Particles';

function ContactUs() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a1a1d]">
      
      {/* Particles Background */}
      <div className="absolute top-0 left-0 w-full h-screen">
        <Particles
          particleColors={["#f3f3f3", "#ffffff"]}
          particleCount={25000}
          particleSpread={50}
          speed={0.05}
          particleBaseSize={50}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Contact Us Section */}
      <div className="relative mt-10 z-10 max-w-4xl mx-auto p-10 text-white">
        <h1 className="text-4xl sm:text-5xl mt-2 font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-violet-400 animate-gradient">
          Contact Us
        </h1>

        <div className="text-center mb-6">
          <p className="text-lg sm:text-xl">
            Let's start a conversation! How can we help you? 
          </p>
          <p className="text-lg sm:text-xl">
            See our platform in action, give suggestions or report a problem which will help us to improve.
          </p>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-xl backdrop-blur-lg border border-violet-500/70">
          <form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="text-white mb-2">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="border border-[#333] rounded-lg p-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="lastName" className="text-white mb-2">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="border border-[#333] rounded-lg p-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="text-white mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="border border-[#333] rounded-lg p-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div className="flex flex-col mb-6">
              <label htmlFor="message" className="text-white mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                className="text-white border border-[#333] rounded-lg p-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-all"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
