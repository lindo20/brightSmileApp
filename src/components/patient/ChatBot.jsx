import React, { useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const userQuestion = question;
      setQuestion('');
      setChatHistory(prev => [...prev, { type: 'user', content: userQuestion }]);
      
      const response = await axios.post('http://localhost:8000/ask', {
        question: userQuestion
      });
      
      const botAnswer = response.data.answer;
      setAnswer(botAnswer);
      setChatHistory(prev => [...prev, { type: 'bot', content: botAnswer }]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'Sorry, there was an error processing your question.';
      setAnswer(errorMessage);
      setChatHistory(prev => [...prev, { type: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="dashboard container py-4">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="h4 mb-4 text-center">
              <i className="bi bi-robot fs-4 me-2"></i>
              AI Dental Assistant
            </h2>
            
            {/* Chat History */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                  <div>
                    <i className="bi bi-chat-square-text fs-1 mb-3"></i>
                    <p>Ask me anything about dental health</p>
                  </div>
                </div>
              ) : (
                chatHistory.map((item, index) => (
                  <div key={index} className={`mb-3 ${item.type === 'user' ? 'text-end' : 'text-start'}`}>
                    <div 
                      className={`d-inline-block p-3 rounded ${item.type === 'user' 
                        ? 'bg-primary text-white rounded-end-0' 
                        : 'bg-light text-dark rounded-start-0'}`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="d-flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your dental question..."
                className="form-control"
                disabled={isLoading}
              />
              <button 
  type="submit" 
  className="btn btn-primary d-flex align-items-center gap-2"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span role="img" aria-label="tooth">🦷</span>
      <span>Thinking...</span>
    </>
  ) : (
    <>
      <span role="img" aria-label="tooth">🦷</span>
      <span>Ask</span>
    </>
  )}
</button>


            </form>
            
            <div className="mt-3 text-center text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              For informational purposes only, not medical advice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;