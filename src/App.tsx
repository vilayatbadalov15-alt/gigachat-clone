import { useState, useEffect, useRef } from 'react';
import Message from './components/Message/Message';
import InputField from './components/InputField/InputField';
import TypingIndicator from './components/TypingIndicator/TypingIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';
import { sendMessageStream } from './api/openrouter-stream';

interface MessageType {
  role: 'user' | 'assistant';
  text: string;
}

interface Chat {
  id: string;
  name: string;
  messages: MessageType[];
  createdAt: number;
}

function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Ошибка парсинга сохранённых чатов', e);
      }
    }
    return [{
      id: '1',
      name: 'Новый чат',
      messages: [
        { role: 'user', text: 'Привет, как дела?' },
        { role: 'assistant', text: 'Привет! Я ассистент. Всё отлично.' }
      ],
      createdAt: Date.now()
    }];
  });

  const [currentChatId, setCurrentChatId] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  
  // Реф для прокрутки
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Сохраняем чаты в localStorage
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId, isLoading]);

  const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0];

  const updateCurrentChat = (updater: (messages: MessageType[]) => MessageType[]) => {
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: updater(chat.messages) }
        : chat
    ));
  };

  const sendMessageToAPI = async (text: string) => {
    updateCurrentChat(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      let fullResponse = '';
      
      await sendMessageStream(
        [{ role: 'user', content: text }],
        (chunk) => {
          if (fullResponse === '' && chunk) {
            setIsLoading(false);
            updateCurrentChat(prev => [...prev, { role: 'assistant', text: '' }]);
          }
          
          fullResponse += chunk;
          
          updateCurrentChat(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0) {
              newMessages[newMessages.length - 1] = { 
                role: 'assistant', 
                text: fullResponse 
              };
            }
            return newMessages;
          });
        },
        () => {
          console.log('Генерация завершена');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Ошибка:', error);
      setIsLoading(false);
      updateCurrentChat(prev => [...prev, { 
        role: 'assistant', 
        text: 'Извините, произошла ошибка.' 
      }]);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: 'Новый чат',
      messages: [],
      createdAt: Date.now()
    };
    setChats(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      }
    }
  };

  const renameChat = (chatId: string, newName: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, name: newName } : chat
    ));
  };

  return (
    <>
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
      />
      <div className="app">
        <div className="messages">
          {currentChat?.messages.map((msg, index) => (
            <Message key={index} role={msg.role} text={msg.text} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} /> {/* невидимый элемент для прокрутки */}
        </div>
        <InputField onSend={sendMessageToAPI} />
      </div>
    </>
  );
}

export default App;