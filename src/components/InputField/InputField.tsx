import { useState } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps {
  onSend: (text: string) => void;
}

function InputField({ onSend }: InputFieldProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim() === '') return;
    onSend(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder="Введите сообщение..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.button} onClick={handleSend}>
        Отправить
      </button>
    </div>
  );
}

export default InputField;