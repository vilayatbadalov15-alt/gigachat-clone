import { useState } from 'react';
import styles from './Message.module.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MessageProps {
  text: string;
  role: 'user' | 'assistant';
}

function Message({ text, role }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Сбрасываем через 2 секунды
    } catch (err) {
      console.error('Не удалось скопировать:', err);
    }
  };

  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.content}>
        {role === 'user' ? (
          text
        ) : (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeHighlight]}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
      
      {/* Кнопка копирования (только для ассистента) */}
      {role === 'assistant' && (
        <button 
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          title="Копировать ответ"
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
    </div>
  );
}

export default Message;