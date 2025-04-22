import React from 'react';
import Aurora from '@/components/Aurora';  
import TiltedCard from '@/components/Tiltcard';  
import Navbar from '@/components/Navbar';
import Particles from '@/components/Particles';

function AboutUs() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      
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
      
      {/* About Us Section */}
      <div className="mt-12 relative z-10 max-w-4xl mx-auto p-4 text-white">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          About Us
        </h1>

        <div className="mt-3 text-center text-lg sm:text-xl">
          <p>
            Front-Fusion is a web-based platform designed to empower developers by simplifying the process of creating and managing code. The platform is based on Tailwind CSS and React JS, providing an all-in-one solution where developers can generate code and edit it directly within the platform's interface. Users can make real-time updates to their code, preview changes instantly, and customize themes and backgrounds for an optimal development experience.
          </p>
          <p className="mt-4 text-lg">
            Our platform leverages cutting-edge technologies like HTML, Tailwind CSS, React JS, and Node JS to bring you an easier and more efficient development experience.
          </p>
        </div>

        {/* Tilted Card with additional info */}
        <div className="flex justify-center mt-2 mb-8">
          <TiltedCard
            imageSrc="https://gradients.app/public/img/gradients_app.png"
            altText="About Us"
            captionText="Objectives"
            containerHeight="200px"
            containerWidth="400px"
            imageHeight="320px"
            imageWidth="320px"
            rotateAmplitude={19}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <div className="text-center">
                <p className="font-bold mt-3 text-2xl text-black">Objectives-</p>
                <div className="space-y-2 mt-3 text-sm text-bold">
                  <p>• We aim to provide real-time Frontend UI code-generation through A.I., focusing mainly on a user-friendly interface.</p>
                  <p>• We offer customization options for generated themes, allowing developers to modify the design, structure, and functionality of the generated code easily.</p>
                  <p>• We introduce a seamless way to upload images directly into the generated-code library, streamlining the development process and saving valuable time.</p>
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
