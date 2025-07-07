// conversation avec des maries

import styles from './messages.module.css';
import Image from 'next/image';

export default function SuperAdminMessagesPage() {
    return (
        <div className={styles.messagesContainer}>
            <div className={styles.header}>
                <h1>
                    <Image
                        src="/icons/rsvp.svg"
                        alt=""
                        width={32}
                        height={32}
                    />
                    Messages des utilisateurs
                </h1>
                <div className={styles.filters}>
                    <select className="superAdminInput">
                        <option value="all">Tous les messages</option>
                        <option value="unread">Non lus</option>
                        <option value="urgent">Urgents</option>
                        <option value="archived">Archivés</option>
                    </select>
                    <input
                        type="search"
                        placeholder="Rechercher un message..."
                        className="superAdminInput"
                    />
                </div>
            </div>

            <div className={styles.messagesList}>
                <div className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                <Image
                                    src="/images/testimonials/julie-nicolas.jpg"
                                    alt=""
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div>
                                <h3>Julie & Nicolas</h3>
                                <span className={styles.date}>Il y a 2 heures</span>
                            </div>
                        </div>
                        <div className={styles.messageStatus}>
                            <span className={styles.urgent}>Urgent</span>
                            <span className={styles.unread}>Non lu</span>
                        </div>
                    </div>
                    <div className={styles.messageContent}>
                        <p>Problème avec le système de paiement...</p>
                    </div>
                    <div className={styles.messageActions}>
                        <button className="superAdminButton secondary">Archiver</button>
                        <button className="superAdminButton secondary">Marquer comme lu</button>
                        <button className="superAdminButton">Répondre</button>
                    </div>
                </div>

                <div className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                <Image
                                    src="/images/testimonials/emma-lucas.jpg"
                                    alt=""
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div>
                                <h3>Emma & Lucas</h3>
                                <span className={styles.date}>Hier</span>
                            </div>
                        </div>
                        <div className={styles.messageStatus}>
                            <span className={styles.read}>Lu</span>
                        </div>
                    </div>
                    <div className={styles.messageContent}>
                        <p>Question sur la personnalisation du design...</p>
                    </div>
                    <div className={styles.messageActions}>
                        <button className="superAdminButton secondary">Archiver</button>
                        <button className="superAdminButton">Répondre</button>
                    </div>
                </div>
            </div>

            <div className={styles.pagination}>
                <button className="superAdminButton secondary">Précédent</button>
                <div className={styles.pageNumbers}>
                    <button className={styles.activePage}>1</button>
                    <button>2</button>
                    <button>3</button>
                    <span>...</span>
                    <button>10</button>
                </div>
                <button className="superAdminButton secondary">Suivant</button>
            </div>
        </div>
    );
}