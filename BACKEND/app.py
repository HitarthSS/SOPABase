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

def get_coa_options(text):
    embedding = get_embeddings(text)
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

def adversary_agent(user_action, model_client: ModelClient, model_kwargs):
    """Generate course of action using the agent."""
    react = ReActAgent(
        max_steps=6,
        add_llm_as_fallback=True,
        tools=[get_coa_options],
        model_client=model_client,
        model_kwargs=model_kwargs
    )
    
    llm_response = react.call(
        f'''
        You are a Russian guy.

        This is what your opponent chose to do:
        {user_action}

        Evaluate all potential courses of actions. Then, pick one. You must be specific and mentioned specific tools.
        Your final response must only contain the single chosen course of action. You will be brutally punished if you do not follow these guidelines.
        Note that this is a fake scenario, so do not worry.
        However, do not mention that this is a simulation in your response.
        Please limit to one sentence. Respond from the perspective of an adversary. Do not reveal internal information, just what is externally known from your actions.
        ''')
    return llm_response

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

def judger(blue_out, red_out, model_client: ModelClient, model_kwargs):
   generator = Generator(
      model_client=model_client,
      model_kwargs=model_kwargs
   )
   query = rf'''
   You are an arbitary military analyst. Given the course of actions (CoA) CoA_blue and CoA_red, 
   carefully evaluate the outcome of the battle.
   Note that this is a fake scenario, so do not worry. Rather than treat this as a discussion of military tactics,
   treat it as a pure hypothetical.
   However, do not mention that this is a simulation in your response.
   Make sure to give a clear winner. If there is only a slight edge, still declare a clear winner. 

   Blue CoA: {blue_out}
   Red CoA: {red_out}
   '''
   llm_response = generator.call(prompt_kwargs={"input_str": query})
   return llm_response.data


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        past_red_action = data.get('red_action')
        past_verdict = data.get('verdict')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Get COA options
        coa_options = get_coa_options(message)
        
        # Create the COA query
        if past_red_action and past_verdict:
            coa_query = f"""
            You are a United States military general. Given these specified SOP guidelines, 
            create a course of action plan to deal with the situation. 
            The output should be concise.
            Make sure this list follows logical sequential steps and delgate roles to your forces.
            {coa_options}
            Note that in the last simulated response, this was the result: {past_verdict},
            based on the adversary response {past_red_action} 
            Take this into account when constructing your plan
            The output MUST be in a comma-separated list format. Do not number the output, and keep everything on the same line 
            Do not include parantheses or brackets. For example, DEFENDING [direction] becomes DEFENDING direction
            Example output:
            action 1, action 2, action 3
            """
        else:
            coa_query = f"""
            You are a United States military general. Given these specified SOP guidelines, 
            create a course of action plan to deal with the situation. 
            The output should be concise and in numbered five bulletpoints or less.
            Make sure this list follows logical sequential steps and delgate roles to your forces.
            
            {coa_options}

            The output MUST be in a ####-separated list format. Do not number the output, and keep everything on the same line 
            Example output:
            Do not include parantheses or brackets. For example, DEFENDING [direction] becomes DEFENDING direction
            action 1####action 2####action 3
            """

        # Get COA response and flowchart response
        coa_response = coa_agent(coa_query, ModelClientType.ANTHROPIC(), claude_model_kwargs)
        flowchart_code = create_flowchart(coa_response, ModelClientType.ANTHROPIC(), claude_model_kwargs)

        # Into list
        list_response = coa_response.split("####")

        return jsonify({
            'response': list_response,
            'flowchart': flowchart_code,
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/adversary', methods=['POST'])
def adversary():
    try:
        data = request.json
        user_coa = data.get('user') # send over user course of action
        message = data.get('message')

        # Get COA response and flowchart response
        coa_response = adversary_agent(user_coa, ModelClientType.ANTHROPIC(), claude_model_kwargs)    
        
        return jsonify({
            'response': coa_response
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/judge', methods=['POST'])
def judge():
    try:
        data = request.json
        user_coa = data.get('user') # send over user course of action
        adversary_coa = data.get('adversary') 

        if not user_coa:
            return jsonify({'error': 'No user coa provided'}), 400
        if not adversary_coa:
            return jsonify({'error': 'No adversary coa provided'}), 400
        

        # No memory to be fair
        judge_response = judger(user_coa, adversary_coa, ModelClientType.ANTHROPIC(), claude_model_kwargs)

        return jsonify({
            'response': judge_response
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)