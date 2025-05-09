---
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# Integrations: Tracing

Phoenix natively works with a variety of frameworks and SDKs across [Python](./#python) and [JavaScript](./#javascript) via OpenTelemetry auto-instrumentation. These auto-instrumentors capture and trace any requests made to their respective packages. Phoenix can also be natively integrated with AI platforms such as [LangFlow](./#platforms) and [LiteLLM proxy](./#platforms).

## Python

### Providers

<table data-view="cards" data-full-width="false"><thead><tr><th data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><a href="openai.md">openai.md</a></td><td><a href="../../.gitbook/assets/openai logo.png">openai logo.png</a></td><td></td></tr><tr><td><a href="anthropic.md">anthropic.md</a></td><td><a href="../../.gitbook/assets/gitbooks_anthropic.png">gitbooks_anthropic.png</a></td><td></td></tr><tr><td><a href="groq.md">groq.md</a></td><td><a href="../../.gitbook/assets/gitbook_groq.png">gitbook_groq.png</a></td><td></td></tr><tr><td><a href="vertexai.md">vertexai.md</a></td><td><a href="../../.gitbook/assets/vertexai_gitbooks.png">vertexai_gitbooks.png</a></td><td></td></tr><tr><td><a href="mistralai.md">mistralai.md</a></td><td><a href="../../.gitbook/assets/gitbook_mistral.png">gitbook_mistral.png</a></td><td></td></tr><tr><td><a href="bedrock.md">bedrock.md</a></td><td><a href="../../.gitbook/assets/gitbook_bedrock (1).png">gitbook_bedrock (1).png</a></td><td></td></tr><tr><td><a href="litellm.md">litellm.md</a></td><td><a href="../../.gitbook/assets/gitbook_litellm.png">gitbook_litellm.png</a></td><td><a href="litellm.md">litellm.md</a></td></tr></tbody></table>

### Frameworks

<table data-view="cards"><thead><tr><th data-type="content-ref"></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td><a href="llamaindex.md">llamaindex.md</a></td><td></td><td><a href="../../.gitbook/assets/llamaindex logo.png">llamaindex logo.png</a></td></tr><tr><td><a href="llamaindex-1.md">llamaindex-1.md</a></td><td></td><td><a href="../../.gitbook/assets/llamaindex logo.png">llamaindex logo.png</a></td></tr><tr><td><a href="langchain.md">langchain.md</a></td><td></td><td><a href="../../.gitbook/assets/gitbook_langchain (1).png">gitbook_langchain (1).png</a></td></tr><tr><td><a href="langgraph.md">langgraph.md</a></td><td></td><td><a href="../../.gitbook/assets/gitbook_langchain (1).png">gitbook_langchain (1).png</a></td></tr><tr><td><a href="openai-agents-sdk.md">openai-agents-sdk.md</a></td><td><a href="openai-agents-sdk.md">openai-agents-sdk.md</a></td><td><a href="../../.gitbook/assets/gitbook_openai.png">gitbook_openai.png</a></td></tr><tr><td><a href="hfsmolagents.md">hfsmolagents.md</a></td><td><a href="hfsmolagents.md">hfsmolagents.md</a></td><td><a href="../../.gitbook/assets/gitbook_huggingface.png">gitbook_huggingface.png</a></td></tr><tr><td><a href="haystack.md">haystack.md</a></td><td></td><td><a href="../../.gitbook/assets/gitbooks_haystack.png">gitbooks_haystack.png</a></td></tr><tr><td><a href="dspy.md">dspy.md</a></td><td></td><td><a href="../../.gitbook/assets/gitbooks_dspy.png">gitbooks_dspy.png</a></td></tr><tr><td><a href="guardrails-ai.md">guardrails-ai.md</a></td><td></td><td><a href="../../.gitbook/assets/gitbooks_guardrails.png">gitbooks_guardrails.png</a></td></tr><tr><td><a href="crewai.md">crewai.md</a></td><td></td><td><a href="../../.gitbook/assets/crewai logo.png">crewai logo.png</a></td></tr><tr><td><a href="autogen-support.md">autogen-support.md</a></td><td></td><td><a href="../../.gitbook/assets/autogen logoo.png">autogen logoo.png</a></td></tr><tr><td><a href="prompt-flow.md">prompt-flow.md</a></td><td></td><td><a href="../../.gitbook/assets/promptflow_logo.png">promptflow_logo.png</a></td></tr><tr><td><a href="instructor.md">instructor.md</a></td><td></td><td><a href="../../.gitbook/assets/openai logo.png">openai logo.png</a></td></tr></tbody></table>

## Javascript

<table data-view="cards" data-full-width="false"><thead><tr><th data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td><a href="openai-node-sdk.md">openai-node-sdk.md</a></td><td><a href="../../.gitbook/assets/openai logo.png">openai logo.png</a></td></tr><tr><td><a href="langchain.js.md">langchain.js.md</a></td><td><a href="../../.gitbook/assets/gitbook_langchain (1).png">gitbook_langchain (1).png</a></td></tr><tr><td><a href="vercel-ai-sdk.md">vercel-ai-sdk.md</a></td><td><a href="../../.gitbook/assets/gitbook_vercel.png">gitbook_vercel.png</a></td></tr><tr><td><a href="beeai.md">beeai.md</a></td><td><a href="../../.gitbook/assets/gitbook_beeai.png">gitbook_beeai.png</a></td></tr></tbody></table>



## Platforms

<table data-view="cards"><thead><tr><th></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td><a href="langflow.md">Langflow</a></td><td><a href="langflow.md">langflow.md</a></td><td><a href="../../.gitbook/assets/gitbook_langflow.png">gitbook_langflow.png</a></td></tr><tr><td>LiteLLM Proxy</td><td></td><td><a href="../../.gitbook/assets/gitbook_litellm.png">gitbook_litellm.png</a></td></tr><tr><td><a href="beeai.md">BeeAI</a></td><td><a href="beeai.md">beeai.md</a></td><td><a href="../../.gitbook/assets/gitbook_beeai.png">gitbook_beeai.png</a></td></tr></tbody></table>



## Request an Integration

Don't see an integration you were looking for? We'd love to [hear from you!](https://github.com/Arize-ai/openinference/issues/new/choose)

