import adalflow as adal
from adalflow.components.agent import ReActAgent
from adalflow.core import Generator, ModelClientType, ModelClient
from adalflow.utils import setup_env

setup_env(dotenv_path=r"C:\Users\edmun\Desktop\VSCode Projects\SOPABase\sopabase\agents\.env") 

claude_model_kwargs = {
   "model": "claude-3.5",  
   "temperature": 0.0,
   "max_tokens": 5000
}

task_desc = r"""You are a United States military general.
Create a course of action given the facts and assumptions given about the battle situation."""

tools = r"""{% if tools %}
<TOOLS>
{% for tool in tools %}
{{ loop.index }}.
{{tool}}
------------------------
{% endfor %}
</TOOLS>
{% endif %}
{{output_format_str}}"""

task_spec = r"""<TASK_SPEC>
- For simple queries: Directly call the ``finish`` action and provide the answer.
- For complex queries:
   - Step 1: Read the user query and potentially divide it into subqueries. And get started with the first subquery.
   - Call one available tool at a time to solve each subquery/subquestion. \
   - At step 'finish', join all subqueries answers and finish the task.
Remember:
- Action must call one of the above tools with name. It can not be empty.
- You will always end with 'finish' action to finish the task. The answer can be the final answer or failure message.
</TASK_SPEC>"""

step_history = r"""User query:
{{ input_str }}
{# Step History #}
{% if step_history %}
<STEPS>
{% for history in step_history %}
Step {{ loop.index }}.
"Thought": "{{history.action.thought}}",
"Action": "{{history.action.action}}",
"Observation": "{{history.observation}}"
------------------------
{% endfor %}
</STEPS>
{% endif %}
You:"""

def finish(answer: str) -> str:
   """Finish the task with answer."""
   return answer

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
      #add_llm_as_fallback=True,
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
