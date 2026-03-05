import styles from './Sidebar.module.css';

interface Chat {
  id: string;
  name: string;
  messages: MessageType[];
  createdAt: number;
}

interface MessageType {
  role: 'user' | 'assistant';
  text: string;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newName: string) => void;
}

function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat
}: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>Чаты</h2>
        <button onClick={onNewChat} className={styles.newChatButton}>
          + Новый чат
        </button>
      </div>
      
      <div className={styles.chatList}>
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`${styles.chatItem} ${currentChatId === chat.id ? styles.active : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className={styles.chatInfo}>
              <div className={styles.chatName}>{chat.name}</div>
              <div className={styles.chatDate}>
                {new Date(chat.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Удалить чат?')) {
                  onDeleteChat(chat.id);
                }
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;