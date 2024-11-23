import adalflow as adal
from adalflow.components.agent import ReActAgent
from adalflow.core import Generator, ModelClientType, ModelClient
from adalflow.utils import setup_env

setup_env(dotenv_path=r"C:\Users\edmun\Desktop\VSCode Projects\SOPABase\BACKEND\agents\.env") 

claude_model_kwargs = {
   "model": "claude-3-5-sonnet-20240620",  
   "temperature": 0.0,
   "max_tokens": 5000
}

def coa_agent(query, model_client: ModelClient, model_kwargs):
  
   generator = Generator(
      model_client=model_client,
      model_kwargs=model_kwargs,
   )

   llm_response = generator.call(prompt_kwargs={"input_str": query})
   print(f"LLM response: {llm_response}")
   print("")

query = "You are a battle expert. How can I win the battle given this information?"
coa_agent(query, ModelClientType.ANTHROPIC(), claude_model_kwargs)
