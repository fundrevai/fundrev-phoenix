# Reference (citation) Link

## Reference Links in Retrieval Q\&A

In chatbots and Q\&A systems, many times reference links are provided in the response, along with an answer, to help point users to documentation or pages that contain more information or the source for the answer.

**EXAMPLE**: Q\&A from Arize-Phoenix Documentation

**QUESTION**: What other models does Arize Phoenix support beyond OpenAI for running Evals?

**ANSWER**: Phoenix does support a large set of LLM models through the model object. Phoenix supports OpenAI (GPT-4, GPT-4-32k, GPT-3.5 Turbo, GPT-3.5 Instruct, etc...), Azure OpenAI, Google Palm2 Text Bison, and All AWS Bedrock models (Claude, Mistral, etc...).

**REFERENCE LINK**: [https://arize.com/docs/phoenix/api/evaluation-models](https://colab.research.google.com/corgiredirector?site=https%3A%2F%2Fdocs.arize.com%2Fphoenix%2Fapi%2Fevaluation-models)

This Eval checks the reference link returned answers the question asked in a conversation

{% hint style="info" %}
We are continually iterating our templates, view the most up-to-date template [on GitHub](https://github.com/Arize-ai/phoenix/blob/ecef5242d2f9bb39a2fdf5d96a2b1841191f7944/packages/phoenix-evals/src/phoenix/evals/default_templates.py#L381).
{% endhint %}

<pre class="language-python"><code class="lang-python"><strong>print(REF_LINK_EVAL_PROMPT_TEMPLATE_STR)
</strong>
<strong>You are given a conversation that contains questions by a CUSTOMER and you are trying
</strong>to determine if the documentation page shared by the ASSISTANT correctly answers
the CUSTOMERS questions. We will give you the conversation between the customer
and the ASSISTANT and the text of the documentation returned:
    [CONVERSATION AND QUESTION]:
    {conversation}
    ************
    [DOCUMENTATION URL TEXT]:
    {document_text}
    [DOCUMENTATION URL TEXT]:
You should respond "correct" if the documentation text answers the question the
CUSTOMER had in the conversation. If the documentation roughly answers the question
even in a general way the please answer "correct". If there are multiple questions and a single
question is answered, please still answer "correct". If the text does not answer the
question in the conversation, or doesn't contain information that would allow you
to answer the specific question please answer "incorrect".
</code></pre>

## How to run the Citation Eval

<pre class="language-python"><code class="lang-python"><strong>from phoenix.evals import (
</strong><strong>    REF_LINK_EVAL_PROMPT_RAILS_MAP,
</strong>    REF_LINK_EVAL_PROMPT_TEMPLATE_STR,
    OpenAIModel,
    download_benchmark_dataset,
    llm_classify,
)

model = OpenAIModel(
    model_name="gpt-4",
    temperature=0.0,
)

#The rails is used to hold the output to specific values based on the template
#It will remove text such as ",,," or "..."
#Will ensure the binary value expected from the template is returned
rails = list(REF_LINK_EVAL_PROMPT_RAILS_MAP.values())
relevance_classifications = llm_classify(
    dataframe=df,
    template=REF_LINK_EVAL_PROMPT_TEMPLATE_STR,
    model=model,
    rails=rails,
    provide_explanation=True, #optional to generate explanations for the value produced by the eval LLM
)
</code></pre>

## Benchmark Results

This benchmark was obtained using notebook below. It was run using a handcrafted ground truth dataset consisting of questions on the Arize platform. That [dataset is available here](https://storage.googleapis.com/arize-assets/phoenix/evals/ref-link-classification/ref_link_golden_test_data.csv).

Each example in the dataset was evaluating using the `REF_LINK_EVAL_PROMPT_TEMPLATE_STR` above, then the resulting labels were compared against the ground truth label in the benchmark dataset to generate the confusion matrices below.

{% embed url="https://colab.research.google.com/drive/1mAjcIYWCDi9TNFE3p7xRiw0L0hwHzk-q?usp=sharing" %}

**GPT-4 Results**

<figure><img src="../../../.gitbook/assets/GPT-4 Ref Evals (3).png" alt=""><figcaption></figcaption></figure>

<table><thead><tr><th width="130">Reference Link Evals</th><th>GPT-4o</th></tr></thead><tbody><tr><td>Precision</td><td><mark style="color:green;">0.96</mark></td></tr><tr><td>Recall</td><td><mark style="color:green;">0.79</mark></td></tr><tr><td>F1</td><td><mark style="color:green;">0.87</mark></td></tr></tbody></table>
