import React, { useRef } from "react";
import styled from "styled-components";

const MessageInput = () => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <StyledWrapper>
      <div className="message-box">
        <button type="button" className="icon-button" onClick={handleFileClick}>
          <PlusIcon />
        </button>

        <input 
          type="text" 
          placeholder="Prompt Your Ideas Here!..." 
          className="message-input"
        />
        
        <input type="file" className="visually-hidden" ref={fileInputRef} />

        <button type="submit" className="icon-button send-button">
          <SendIcon />
        </button>
      </div>
    </StyledWrapper>
  );
};

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path stroke="currentColor" strokeWidth="2" fill="none" d="M12 4v16M4 12h16" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path stroke="currentColor" strokeWidth="2" fill="none" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1rem;

  .message-box {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 600px;
    min-height: 3rem;
    background-size: 300% 300%;
    backdrop-filter: blur(1rem);
    border-radius: 5rem;
    transition: 0.5s;
    animation: gradient_301 5s ease infinite;
    border: double 4px transparent;
    background-image: linear-gradient(#212121, #212121),
      linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #0044ff 87%);
    background-origin: border-box;
    background-clip: content-box, border-box;
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    color: white;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .message-input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    color: white;
    font-size: 1rem;
    padding: 0 1rem;
    min-width: 50px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    &:focus {
      outline: none;
    }
  }

  .send-button {
    margin-left: auto;
    &:hover {
      color: #fe53bb;
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .message-box {
      max-width: 90%;
      padding: 0.5rem;
    }
    .icon-button {
      width: 2rem;
      height: 2rem;
    }
    .message-input {
      font-size: 0.9rem;
      padding: 0 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .message-box {
      max-width: 95%;
      padding: 0.3rem;
    }
    .icon-button {
      width: 1.8rem;
      height: 1.8rem;
    }
    .message-input {
      font-size: 0.8rem;
      padding: 0 0.5rem;
    }
  }

  @keyframes gradient_301 {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default MessageInput;
