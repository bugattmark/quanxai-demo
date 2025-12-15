'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';

export default function APIReferencePage() {
  const [activeTab, setActiveTab] = useState('openai');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'openai', label: 'OpenAI Python SDK' },
    { id: 'llamaindex', label: 'LlamaIndex' },
    { id: 'langchain', label: 'Langchain Py' },
  ];

  const codeExamples = {
    openai: `import openai

client = openai.OpenAI(
    api_key="your_api_key",
    base_url="<your_proxy_base_url>" # LiteLLM Proxy is OpenAI compatible, Read More: https://docs.litellm.ai/docs/proxy/user_keys
)

response = client.chat.completions.create(
    model="gpt-3.5-turbo", # model to send to the proxy
    messages = [
        {
            "role": "user",
            "content": "this is a test request, write a short poem"
        }
    ]
)

print(response)`,
    llamaindex: `from llama_index.llms.openai_like import OpenAILike

llm = OpenAILike(
    model="gpt-3.5-turbo",
    api_base="<your_proxy_base_url>",
    api_key="your_api_key",
    timeout=600,
    max_retries=3
)

response = llm.complete("test from litellm. tell me why it's amazing in 1 sentence")

print(response)`,
    langchain: `from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage

chat = ChatOpenAI(
    openai_api_base="<your_proxy_base_url>",
    model = "gpt-3.5-turbo",
    temperature=0.1
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that im using to make a test request to."
    ),
    HumanMessage(
        content="test from litellm. tell me why it's amazing in 1 sentence"
    ),
]

response = chat(messages)

print(response)`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab as keyof typeof codeExamples]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              OpenAI Compatible Proxy: API Reference
            </h1>
            <p className="text-gray-600">
              LiteLLM is OpenAI Compatible. This means your API Key works with the OpenAI SDK.
              Just replace the base_url to point to your litellm proxy. Example Below
            </p>
          </div>
          <a
            href="https://docs.litellm.ai/docs/proxy/user_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            API Reference Docs
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Block */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Python</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm">
              <code className="language-python text-gray-800">
                {codeExamples[activeTab as keyof typeof codeExamples]}
              </code>
            </pre>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Replace <code className="px-2 py-0.5 bg-blue-100 rounded text-xs">&lt;your_proxy_base_url&gt;</code> with your actual LiteLLM proxy URL
            and <code className="px-2 py-0.5 bg-blue-100 rounded text-xs">your_api_key</code> with your API key.
          </p>
        </div>
      </div>
    </div>
  );
}
