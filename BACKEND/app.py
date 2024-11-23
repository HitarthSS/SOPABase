# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
import adalflow as adal
from adalflow.components.agent import ReActAgent
from adalflow.core import Generator, ModelClientType, ModelClient
from supabase import create_client
from adalflow.utils import setup_env
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize clients
client = OpenAI(api_key="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")
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Initialize Supabase
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

# Claude model configuration
claude_model_kwargs = {
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.0,
    "max_tokens": 5000
}

def get_embeddings(text):
    """Generate embeddings for the input text."""
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def get_coa_options(embedding):
    """Get course of action options from Supabase."""
    response = supabase.rpc('match_documents', {
        "query_embedding": embedding,
        "match_threshold": -1,
        "match_count": 10,
        "categories": ['Army', 'Overall']
    }).execute()
    
    return [item["content"] for item in response.data[:-1]]

def coa_agent(query, model_client: ModelClient, model_kwargs):
    """Generate course of action using the agent."""
    generator = Generator(
        model_client=model_client,
        model_kwargs=model_kwargs,
    )
    
    llm_response = generator.call(prompt_kwargs={"input_str": query})
    return llm_response.data

def create_flowchart(coa_output, model_client: ModelClient, model_kwargs):
   generator = Generator(
         model_client=model_client,
         model_kwargs=model_kwargs,
      )
   query = rf'''
            Based on the the provided course of action below, create Mermaid diagram code to model the situation and the actions taken.
            Your response should be only in the format 
            """
            graph 
            <input specifications ... >
            """ Do not include the word mermaid
            Course of action: {coa_output}
            '''
   llm_response = generator.call(prompt_kwargs={"input_str": query})
   return llm_response.data

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        previous_messages = data.get('messages', [])
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Generate embeddings for the input
        embedding = get_embeddings(message)
        
        # Get COA options
        coa_options = get_coa_options(embedding)
        
        # Create the COA query
        coa_query = f"""
        You are a United States military general. Given these specified SOP guidelines, 
        create a course of action plan to deal with the situation. 
        The output should be concise and in numbered five bulletpoints or less.
        Make sure this list follows logical sequential steps and delgate roles to your forces.
        {coa_options}
        """
        
        # Get COA response and flowchart response
        coa_response = coa_agent(coa_query, ModelClientType.ANTHROPIC(), claude_model_kwargs)
        flowchart_code = create_flowchart(coa_response, ModelClientType.ANTHROPIC(), claude_model_kwargs)

        # Format all messages for context
        formatted_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in previous_messages
        ]
        formatted_messages.append({"role": "user", "content": message})
        
        # Get final response from Claude
        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=formatted_messages
        )
        
        
        # Combine COA response with Claude's response
        final_response = f"""Course of Action Analysis:
        {coa_response}
        
        Additional Context:
        {response.content[0].text}"""

        return jsonify({
            'response': final_response,
            'flowchart': flowchart_code
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)