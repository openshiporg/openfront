'use client';

import { useState } from 'react';

export default function MCPDemoPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const res = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
        credentials: 'include', // Include cookies
      });

      if (!res.ok) {
        const error = await res.json();
        setResponse(`Error: ${error.error || error.details || 'Unknown error'}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setResponse('Error: No response body');
        return;
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = line.slice(2);
            if (text.startsWith('"') && text.endsWith('"')) {
              fullResponse += JSON.parse(text);
            }
            setResponse(fullResponse);
          }
        }
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MCP Demo</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'List all users' or 'Get all todos' or 'Show me the users in the system'"
            className="w-full p-3 border border-gray-300 rounded-md h-32 resize-vertical"
            disabled={loading}
          />
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Send'}
        </button>
        
        {response && (
          <div>
            <label className="block text-sm font-medium mb-2">Response:</label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}