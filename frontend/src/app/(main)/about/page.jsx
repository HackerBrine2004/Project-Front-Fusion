import React from 'react';
import Aurora from '@/components/Aurora';  
import TiltedCard from '@/components/Tiltcard';  
import Navbar from '@/components/Navbar';
import Particles from '@/components/Particles';

function AboutUs() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a1a1d] text-white">
      
      <div className="absolute top-0 left-0 w-full h-screen">
        <Particles
          particleColors={["#f3f3f3", "#ffffff"]}
          particleCount={25000}
          particleSpread={50}
          speed={0.05}
          particleBaseSize={50}
          moveParticlesOnHover={false}
          alphaParticles={true}
          disableRotation={true}
        />
      </div>
      
      {/* About Us Section */}
      <div className="mt-12 relative z-10 max-w-4xl mx-auto p-6 text-white">
        <h1 className="text-5xl font-semibold text-center text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 mb-6">
          About Us
        </h1>

        <div className="mt-4 text-center text-lg sm:text-xl space-y-4">
          <p>
            Hi, I'm Arunav Aaron Singh, the creator of Front Fusion — a powerful and user-friendly platform designed to streamline front-end development. I built Front Fusion to help developers generate, preview, and edit React-based UI components in real time, without the usual setup hassle.
          </p>
          <p className="mt-4 text-lg">
            Powered by advanced technologies such as HTML, Tailwind CSS, React JS, and Node JS, Front-Fusion ensures an efficient, easy-to-use development environment tailored to your workflow.
          </p>
        </div>

        {/* Tilted Card with additional info */}
        <div className="flex justify-center mt-8 mb-12">
          <TiltedCard
            imageSrc="https://gradients.app/public/img/gradients_app.png"
            altText="About Us"
            captionText="Objectives"
            containerHeight="220px"
            containerWidth="420px"
            imageHeight="330px"
            imageWidth="330px"
            rotateAmplitude={12}
            scaleOnHover={1.1}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <div className="text-center text-white">
                <p className="font-bold mt-3 text-2xl text-purple-300">Objectives-</p>
                <div className="space-y-5 mt-3 text-bold text-sm text-gray-900">
                  <p>• Providing real-time frontend UI code-generation through AI with a focus on a user-friendly interface.</p>
                  <p>• Offering customization options for generated themes, allowing developers to easily modify the design and functionality of the code.</p>
                  <p>• Streamlining the development process by enabling image uploads directly into the generated-code library.</p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
