'use client';

import { useState, useRef } from 'react';
import {
  Terminal,
  Play,
  Loader2,
  Copy,
  Trash2,
  Settings,
  Zap,
  Clock,
  DollarSign,
  ChevronDown,
} from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  inputCost: number;
  outputCost: number;
}

const models: ModelOption[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputCost: 0.005, outputCost: 0.015 },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', inputCost: 0.03, outputCost: 0.06 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', inputCost: 0.0015, outputCost: 0.002 },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', inputCost: 0.003, outputCost: 0.015 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputCost: 0.00025, outputCost: 0.00125 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputCost: 0.015, outputCost: 0.075 },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', inputCost: 0.00265, outputCost: 0.0035 },
];

const keys = [
  { id: 'key-1', alias: 'Production API' },
  { id: 'key-2', alias: 'Development Key' },
  { id: 'key-3', alias: 'Data Science' },
  { id: 'key-7', alias: 'Test Key' },
];

export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [selectedKey, setSelectedKey] = useState(keys[0].id);
  const [systemMessage, setSystemMessage] = useState('You are a helpful AI assistant.');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<{
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    cost: number;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  const responseRef = useRef<HTMLDivElement>(null);

  const currentModel = models.find((m) => m.id === selectedModel)!;

  const simulateResponse = async () => {
    setIsLoading(true);
    setResponse('');
    setMetrics(null);

    const startTime = Date.now();
    const newMessage: Message = { role: 'user', content: userMessage };
    setMessages([...messages, newMessage]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockResponses: Record<string, string> = {
      'gpt-4o': `I'd be happy to help you with that! As GPT-4o, I can assist with coding, analysis, writing, and more.

Here's an example:

\`\`\`python
def hello_world():
    print("Hello from GPT-4o!")
    return True
\`\`\`

Is there anything specific you'd like me to help you with?`,
      'claude-3-sonnet': `Hello! I'm Claude 3 Sonnet, ready to assist you with:

- **Analysis**: Complex reasoning and problem-solving
- **Writing**: Creative and technical content
- **Coding**: Multiple programming languages

How can I help you today?`,
      default: `This is a simulated response from ${currentModel.name}. In production, this would be a real API call through your proxy.`,
    };

    const fullResponse = mockResponses[selectedModel] || mockResponses['default'];

    for (let i = 0; i < fullResponse.length; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setResponse(fullResponse.substring(0, i + 5));
    }
    setResponse(fullResponse);

    const latencyMs = Date.now() - startTime;
    const inputTokens = Math.floor((systemMessage.length + userMessage.length) / 4);
    const outputTokens = Math.floor(fullResponse.length / 4);
    const cost = (inputTokens / 1000) * currentModel.inputCost + (outputTokens / 1000) * currentModel.outputCost;

    setMetrics({
      inputTokens,
      outputTokens,
      latencyMs,
      cost,
    });

    setMessages([
      ...messages,
      newMessage,
      { role: 'assistant', content: fullResponse },
    ]);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim() || isLoading) return;
    simulateResponse();
    setUserMessage('');
  };

  const handleClear = () => {
    setMessages([]);
    setResponse('');
    setMetrics(null);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-600">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">API Playground</h1>
        </div>
        <p className="text-sm text-gray-500">
          Test your API keys and model configurations in an interactive environment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Model Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Model</h3>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded p-2">
                <span className="text-gray-500">Input</span>
                <p className="text-gray-900 font-medium">${currentModel.inputCost}/1K</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <span className="text-gray-500">Output</span>
                <p className="text-gray-900 font-medium">${currentModel.outputCost}/1K</p>
              </div>
            </div>
          </div>

          {/* API Key Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">API Key</h3>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {keys.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.alias}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
              />
            </button>
            {showSettings && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metrics */}
          {metrics && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Request Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Tokens</p>
                    <p className="text-sm text-gray-900">
                      {metrics.inputTokens} / {metrics.outputTokens}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Latency</p>
                    <p className="text-sm text-gray-900">{metrics.latencyMs}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Estimated Cost</p>
                    <p className="text-sm text-green-600 font-medium">${metrics.cost.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col h-[600px]">
          {/* System Message */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-xs text-gray-500 mb-2">System Message</label>
            <textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              placeholder="Set the behavior of the assistant..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Response Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={responseRef}>
            {messages.length === 0 && !response ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Send a message to start testing</p>
                  <p className="text-sm mt-1">Responses will stream in real-time</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap text-sm font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {isLoading && response && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white border border-gray-200 text-gray-900">
                      <pre className="whitespace-pre-wrap text-sm font-sans">{response}</pre>
                      <span className="animate-pulse">|</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Response Actions */}
          {response && !isLoading && (
            <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-2">
              <button
                onClick={copyResponse}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !userMessage.trim()}
                className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
