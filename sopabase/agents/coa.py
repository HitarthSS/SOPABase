import adalflow as adal
from adalflow.components.agent import ReActAgent
from adalflow.core import Generator, ModelClientType, ModelClient
from adalflow.utils import setup_env

setup_env()

claude_model_kwargs = {
   "model": "claude-3",  # llama3 70b works better than 8b here.
   "temperature": 0.0,
}

task_desc = r"""You are a United States military general.
Create a course of action given the facts and assumptions given about the battle situation."""

def coa_agent(model_client: ModelClient, model_kwargs):
   queries = [
      "What is the capital of France? and what is 465 times 321 then add 95297 and then divide by 13.2?",
      "Give me 5 words rhyming with cool, and make a 4-sentence poem using them",
   ]
   # define a generator without tools for comparison

   generator = Generator(
      model_client=model_client,
      model_kwargs=model_kwargs,
   )

   react = ReActAgent(
      max_steps=6,
      add_llm_as_fallback=True,
      model_client=model_client,
      model_kwargs=model_kwargs,
   )

   for query in queries:
      print(f"Query: {query}")
      agent_response = react.call(query)
      llm_response = generator.call(prompt_kwargs={"input_str": query})
      print(f"Agent response: {agent_response}")
      print(f"LLM response: {llm_response}")
      print("")

coa_agent(ModelClientType.ANTHROPIC(), claude_model_kwargs)
