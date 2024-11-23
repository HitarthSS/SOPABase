import adalflow as adal
from adalflow.components.agent import ReActAgent
from adalflow.core import Generator, ModelClientType, ModelClient
import supabase
from supabase import create_client
from adalflow.utils import setup_env
from openai import OpenAI

setup_env(dotenv_path=r"C:\Users\edmun\Desktop\VSCode Projects\SOPABase\BACKEND\agents\.env") 
url = "https://seqnpkevwxjyxahcqjah.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcW5wa2V2d3hqeXhhaGNxamFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyOTgyMzAsImV4cCI6MjA0Nzg3NDIzMH0.Qy2jYdMbub4ra4B-RH9FRNCzpeJrYNlteTiTY3oPnxI"
supabase = create_client(url, key)

client = OpenAI()
response = client.embeddings.create(
           input="I am in a situation where my opponent is 30 m away. I need to utilize an attack option to minimize loss. Please help.",
           model="text-embedding-3-small"
       )
embedding = response.data[0].embedding

response = supabase.rpc('match_documents', {
    "query_embedding": embedding,
    "match_threshold": -1,
    "match_count": 10,
    "categories": ['Army', 'Overall']
}).execute()

coa_options = []

for i in range(len(response.data)-1):
   coa_options.append(response.data[i]["content"])


claude_model_kwargs = {
   "model": "claude-3-5-sonnet-20240620",  
   "temperature": 0.0,
   "max_tokens": 5000
}

def coa_agent(query, model_client: ModelClient, model_kwargs, coa_options):
  
   generator = Generator(
      model_client=model_client,
      model_kwargs=model_kwargs,
   )

   llm_response = generator.call(prompt_kwargs={"input_str": query})
   print(f"LLM response: {llm_response}")
   print("")

query = rf"""
You are a United States military general. Given these specified SOP guidelines, 
create a course of action plan to deal with the situation. 
The output should be concise and in five bulletpoints or less. {coa_options}
"""
coa_agent(query, ModelClientType.ANTHROPIC(), claude_model_kwargs, coa_options)
