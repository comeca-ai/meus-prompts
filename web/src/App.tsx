import React, { useState } from 'react';

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
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Prompts</h1>

      <form onSubmit={handleAdd} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Prompt Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          disabled={isAdding}
        />
        <textarea
          placeholder="Prompt Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !title || !content}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#10a37f',
            color: 'white',
            cursor: isAdding ? 'wait' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isAdding ? 'Adding...' : 'Add Prompt'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {prompts.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No prompts yet.</p>
        ) : (
          prompts.map((prompt) => (
            <div key={prompt.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{prompt.title}</h3>
                <button
                  onClick={() => handleDelete(prompt.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Delete
                </button>
              </div>
              <pre style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f9f9f9',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                margin: 0,
                fontFamily: 'monospace'
              }}>
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
