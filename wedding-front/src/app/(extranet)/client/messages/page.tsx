import styles from './messages.module.css';
import Image from 'next/image';

export default function MessagesPage() {
  return (
    <div className={styles.messagesContainer}>
      {/* Liste des conversations */}
      <div className={styles.conversationsList}>
        <div className={styles.searchBar}>
          <input 
            type="search" 
            placeholder="Rechercher une conversation..." 
            className="primaryInput"
          />
        </div>

        <div className={styles.conversations}>
          <div className={`${styles.conversationItem} ${styles.active}`}>
            <div className={styles.userAvatar}>
              <Image
                src="/images/testimonials/julie-nicolas.jpg"
                alt=""
                width={50}
                height={50}
              />
              <span className={styles.status}></span>
            </div>
            <div className={styles.conversationInfo}>
              <div className={styles.conversationHeader}>
                <h3>Julie & Nicolas</h3>
                <span className={styles.time}>14:30</span>
              </div>
              <div className={styles.lastMessage}>
                <p>Bonjour, nous avons une question concernant le menu végétarien...</p>
                <span className={styles.unreadBadge}>2</span>
              </div>
            </div>
          </div>

          <div className={styles.conversationItem}>
            <div className={styles.userAvatar}>
              <Image
                src="/images/testimonials/emma-lucas.jpg"
                alt=""
                width={50}
                height={50}
              />
            </div>
            <div className={styles.conversationInfo}>
              <div className={styles.conversationHeader}>
                <h3>Emma & Lucas</h3>
                <span className={styles.time}>Hier</span>
              </div>
              <div className={styles.lastMessage}>
                <p>Merci pour votre réponse rapide !</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de chat */}
      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div className={styles.chatUser}>
            <Image
              src="/images/testimonials/julie-nicolas.jpg"
              alt=""
              width={40}
              height={40}
            />
            <div>
              <h2>Julie & Nicolas</h2>
              <span>En ligne</span>
            </div>
          </div>
          <div className={styles.chatActions}>
            <button className="iconButton">
              <span>🔍</span>
            </button>
            <button className="iconButton">
              <span>⋮</span>
            </button>
          </div>
        </div>

        <div className={styles.messagesList}>
          <div className={styles.messageDate}>
            <span>Aujourd'hui</span>
          </div>

          <div className={`${styles.message} ${styles.received}`}>
            <p>Bonjour, nous avons une question concernant le menu végétarien pour notre mariage.</p>
            <span className={styles.messageTime}>14:28</span>
          </div>

          <div className={`${styles.message} ${styles.received}`}>
            <p>Est-il possible d'avoir des options véganes également ?</p>
            <span className={styles.messageTime}>14:29</span>
          </div>

          <div className={`${styles.message} ${styles.sent}`}>
            <p>Bonjour ! Bien sûr, nous pouvons prévoir des options véganes. Combien de personnes seraient concernées ?</p>
            <span className={styles.messageTime}>14:45</span>
          </div>
        </div>

        <div className={styles.messageInput}>
          <button className="iconButton">
            <span>😊</span>
          </button>
          <button className="iconButton">
            <span>📎</span>
          </button>
          <input 
            type="text" 
            placeholder="Écrivez votre message..." 
            className="primaryInput"
          />
          <button className="iconButton">
            <span>🎤</span>
          </button>
          <button className="primaryButton">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
} 