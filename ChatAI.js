import React, { useState } from 'react';
import { Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_URL = 'https://api.anthropic.com/v1/messages';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const saveApiKey = (key) => {
    setApiKey(key);
    setIsConfigOpen(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !apiKey) return;

    const newMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          model: 'claude-3-opus-20240229',
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, data.content[0]]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Claude Chat
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>API Configuration</DialogTitle>
                </DialogHeader>
                <Input
                  type="password"
                  placeholder="Enter your Claude API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button onClick={() => saveApiKey(apiKey)}>Save</Button>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {msg.content}
              </span>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="flex w-full">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow mr-2"
            />
            <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatApp;
