'use client';
import React from 'react';
import Link from 'next/link'; // Import the Link component from next/link
import dynamic from 'next/dynamic';

// Dynamically import the MermaidChart component with SSR disabled
const MermaidChart = dynamic(() => import('@/components/ui/mermaid'), {
  ssr: false,
});

const MermaidPanelPage = () => {
  return (
    <div>
      <h1>Mermaid Panel</h1>
      <p>Display your Mermaid chart here</p>

      {/* Render MermaidChart dynamically */}
      <MermaidChart />

      {/* Link to navigate to the source page */}
      <Link href="/" passHref>
        <button className="px-4 py-2 mt-4 bg-blue-500 text-white rounded">
          Go Back to Home
        </button>
      </Link>
    </div>
  );
};

export default MermaidPanelPage;
