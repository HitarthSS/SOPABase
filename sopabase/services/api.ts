interface Context {
    lastUserAction: string | null;
    lastEnemyAction: string | null;
    lastVerdict: string | null;
  }
  
  interface COAResponse {
    content: string;
    actions: string[];
  }
  
  export const api = {
    getCOAResponse: async (query: string, context: Context): Promise<COAResponse> => {
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            context
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get response');
        }
  
        const data = await response.json();
        
        // TODO: Parse actual actions from API response
        return {
          content: data.response,
          actions: [
            "Deploy defensive perimeter with overlapping fields of fire",
            "Conduct tactical retreat to prepared positions",
            "Launch counter-offensive with artillery support",
            "Establish observation posts on high ground"
          ]
        };
      } catch (error) {
        console.error('Error getting COA response:', error);
        throw error;
      }
    },
  
    // Mock responses - can be replaced with real API calls later
    getAdversaryResponse: async (userAction: string): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return `In response to your ${userAction}, enemy forces are conducting a flanking maneuver with mechanized infantry support.`;
    },
  
    getJudgeVerdict: async (userAction: string, enemyAction: string): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return `Analyzing outcome... Based on the defensive position and enemy maneuver, blue forces maintain tactical advantage due to superior positioning.`;
    }
  };