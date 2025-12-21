import React, { useState } from 'react';
import { Button } from "@openai/apps-sdk-ui/components/Button";
// @ts-ignore - The types might not be perfectly resolved in this setup without deeper config
import { Badge } from "@openai/apps-sdk-ui/components/Badge";

const App: React.FC = () => {
  const prompts = window.openai.toolOutput?.prompts || [];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsAdding(true);
    try {
      await window.openai.callTool('add_prompt', { title, content });
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Failed to add prompt', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await window.openai.callTool('delete_prompt', { id });
    } catch (err) {
      console.error('Failed to delete prompt', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-sans text-primary">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg">My Prompts</h1>
        <Badge color="neutral">{prompts.length} items</Badge>
      </div>

      <form onSubmit={handleAdd} className="mb-8 p-4 rounded-2xl border border-default bg-surface shadow-sm flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            placeholder="e.g., Email Rewrite"
            disabled={isAdding}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors min-h-[100px]"
            placeholder="Enter your prompt template..."
            disabled={isAdding}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            color="primary"
            disabled={isAdding || !title || !content}
          >
            {isAdding ? 'Adding...' : 'Add Prompt'}
          </Button>
        </div>
      </form>

      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-secondary italic">
            No prompts found. Add one above!
          </div>
        ) : (
          prompts.map((prompt) => (
            <div key={prompt.id} className="p-4 rounded-2xl border border-default bg-surface hover:border-active transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="heading-sm">{prompt.title}</h3>
                <Button
                  variant="ghost"
                  color="danger"
                  size="small"
                  onClick={() => handleDelete(prompt.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-secondary bg-surface-tertiary p-3 rounded-lg font-mono overflow-x-auto">
                {prompt.content}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
