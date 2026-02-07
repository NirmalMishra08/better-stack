import React from 'react';

const Spinner = ({ size = "3.25em", color = "hsl(214, 97%, 59%)", strokeWidth = 3 }) => {
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <style>
        {`
          @keyframes rotate-spinner {
            100% { transform: rotate(360deg); }
          }
          @keyframes dash-spinner {
            0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
            50% { stroke-dasharray: 90, 200; stroke-dashoffset: -35px; }
            100% { stroke-dashoffset: -125px; }
          }
          .custom-spinner-svg {
            animation: rotate-spinner 2s linear infinite;
            transform-origin: center;
          }
          .custom-spinner-circle {
            fill: none;
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
            stroke-linecap: round;
            animation: dash-spinner 1.5s ease-in-out infinite;
          }
        `}
      </style>
      <svg 
        className="custom-spinner-svg" 
        viewBox="25 25 50 50" 
        style={{ width: size }}
      >
        <circle 
          className="custom-spinner-circle" 
          cx="50" 
          cy="50" 
          r="20" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
};

export default Spinner;