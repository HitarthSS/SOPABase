// components/ui/mermaid.js
import React, { useEffect } from 'react';
import mermaid from 'mermaid';

const MermaidChart = () => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true, // Initialize charts as soon as the content is loaded
    });

    mermaid.contentLoaded();
  }, []);

  return (
    <div className="mermaid">
      {`
        graph TD;
          A[Start] --> B{Is it sunny?};
          B -->|Yes| C[Go to the beach];
          B -->|No| D[Stay indoors];
      `}
    </div>
  );
};

export default MermaidChart; // Default export the component
