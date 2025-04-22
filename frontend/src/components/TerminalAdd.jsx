"use client";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const TerminalSection = () => {
  const [text, setText] = useState("");
  const canvasRef = useRef(null);
  const commands = [
    "🔄 Booting up Front-Flow A.I...",
    "🚀 Connecting to server cloud...",
    "📦 Loading Tailwind CSS & React Components...",
    "🧠 AI Engine: Analyzing project structure...",
    "🎨 Generating responsive UI layouts...",
    "⚡ Optimizing code efficiency & performance...",
    "📂 Auto-importing necessary dependencies...",
    "🛠️ Building modular components for reusability...",
    "🖌️ Applying custom themes & dark mode...",
    "🔗 Ensuring seamless API integration...",
    "🔍 Running accessibility & SEO checks...",
    "💾 Compressing assets for faster load times...",
    "🔒 Implementing security enhancements...",
    "📊 Real-time analytics dashboard: Activated...",
    "📡 Syncing live data updates...",
    "🖥️ Deploying optimized UI to production...",
    "✅ Deployment Successful! � Your site is now live!",
    "🎯 Monitoring system performance...",
    "🔔 Notifications enabled for future updates...",
    "✨ AI is now on standby, ready for new tasks...",
  ];

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;
    const colors = ['rgba(168, 85, 247, 0.5)', 'rgba(147, 51, 234, 0.5)', 'rgba(126, 34, 206, 0.5)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Reset particles that go off screen
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Terminal text effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < commands.length) {
        setText((prev) => prev + "\n" + commands[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <FullScreenSection>
      <ParticlesBackground ref={canvasRef} />
      <ContentWrapper>
        <div className="terminal-wrapper">
          <div className="purple-line" />
          <div className="terminal">
            <div className="terminal-header">
              <div className="buttons">
                <span className="red"></span>
                <span className="yellow"></span>
                <span className="green"></span>
              </div>
              <p>AI Console</p>
            </div>

            <div className="terminal-body">
              <pre>{text}</pre>
              <span className="blinking-cursor">█</span>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </FullScreenSection>
  );
};

// Styled Components
const FullScreenSection = styled.section`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(88, 28, 135, 1) 50%,
    rgba(0, 0, 0, 1) 100%
  );
`;

const ParticlesBackground = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  /* Terminal Wrapper */
  .terminal-wrapper {
    width: 90%;
    max-width: 900px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.9);
  }

  /* Purple Line at the Top */
  .purple-line {
    width: 100%;
    height: 5px;
    background: #a855f7;
    border-radius: 10px 10px 0 0;
  }

  /* Terminal Box */
  .terminal {
    width: 100%;
    min-height: 80vh;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Terminal Header */
  .terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    background: #222;
    color: white;
  }

  .buttons {
    display: flex;
    gap: 5px;
  }

  .buttons span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }

  .red { background: #ff5f56; }
  .yellow { background: #ffbd2e; }
  .green { background: #27c93f; }

  /* Terminal Body */
  .terminal-body {
    flex-grow: 1;
    padding: 15px;
    white-space: pre-wrap;
    overflow-y: auto;
    font-size: 1rem;
    color: #00ff00;
    font-family: "Courier New", monospace;
  }

  /* Blinking Cursor */
  .blinking-cursor {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .terminal-wrapper {
      width: 95%;
      max-width: 800px;
    }
    .terminal {
      min-height: 70vh;
    }
    .terminal-body {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    .terminal-wrapper {
      width: 98%;
      max-width: 600px;
      padding: 10px;
    }
    .terminal {
      min-height: 60vh;
    }
    .terminal-body {
      font-size: 0.85rem;
      padding: 10px;
    }
    .purple-line {
      height: 4px;
    }
  }

  @media (max-width: 480px) {
    .terminal-wrapper {
      width: 98%;
      max-width: 90%;
      padding: 8px;
    }
    .terminal {
      min-height: 50vh;
    }
    .terminal-header {
      padding: 8px;
    }
    .terminal-body {
      font-size: 0.75rem;
      padding: 8px;
    }
    .purple-line {
      height: 3px;
    }
  }
`;

export default TerminalSection;