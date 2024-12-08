import adalflow as adal
from adalflow.datasets.types import Example
from adalflow.eval.answer_match_acc import AnswerMatchAcc
from adalflow.core import ModelClientType
from typing import Dict

from app import coa_agent

# TO DO: proper eval question set (matches formatting)

def load_datasets():
    pass
    # test_data = ??
    # return test_data

class EvalCoA(adal.AdalComponent):
    def __init__(self, model_client: adal.ModelClient, model_kwargs: Dict):
        self.model_client = model_client
        self.model_kwargs = model_kwargs
        eval_fn = AnswerMatchAcc(type="fuzzy_match").compute_single_item
        super().__init__(task=None, eval_fn=eval_fn)

    def prepare_task(self, sample: Example):
        message = sample.question
        task = coa_agent(message, "N/A", "N/A", self.model_client, self.model_kwargs)
        self.task = task
        return self.task.call, {"question": sample.question, "id": sample.id}

    def prepare_eval(self, sample: Example, y_pred: adal.GeneratorOutput) -> float:
        y_label = -1
        if (y_pred is not None and y_pred.data is not None):  # if y_pred and y_pred.data: might introduce bug when the data is 0
            y_label = y_pred.data
        return self.eval_fn, {"y": y_label, "y_gt": sample.answer}
    

def diagnose(model_client: adal.ModelClient, model_kwargs: Dict) -> Dict:

    testset = load_datasets()

    adal_component = EvalCoA(model_client, model_kwargs)
    trainer = adal.Trainer(adaltask=adal_component)
    trainer.diagnose(dataset=testset, split="test")

diagnose(
    ModelClientType.ANTHROPIC(),  
    {"model": "claude-3-5-sonnet-20241022", "temperature": 0.0, "max_tokens": 5000}
)