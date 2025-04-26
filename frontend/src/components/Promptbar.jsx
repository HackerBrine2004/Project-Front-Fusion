import React from "react";
import styled from "styled-components";
import Link from "next/link";

const GetStartedButton = ({ label = "Get Started" }) => {
  return (
    <StyledWrapper>
      <Link href="/signup" className="get-started-button" aria-label={label}>
        {label}
      </Link>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0rem;

  .get-started-button {
    display: inline-block;
    padding: 0.6rem 2rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-radius: 5rem;
    cursor: pointer;
    transition: 0.5s;
    background-size: 300% 300%;
    backdrop-filter: blur(0rem);
    border: double 4px transparent;
    background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
      linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #0044ff 87%);
    background-origin: border-box;
    background-clip: content-box, border-box;
    animation: gradient_301 5s ease infinite;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(254, 83, 187, 0.5);
    }
  }

  @media (max-width: 768px) {
    .get-started-button {
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
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

export default GetStartedButton;
