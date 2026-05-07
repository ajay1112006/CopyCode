'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Copy, Plus, LogIn, ShieldCheck, Zap } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [isJoin, setIsJoin] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isJoin ? '/api/rooms/access' : '/api/rooms';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!isJoin) {
          // If created, now join
          const accessRes = await fetch('/api/rooms/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: roomName, password }),
          });
          if (accessRes.ok) {
            router.push(`/room/${roomName.toLowerCase()}`);
          } else {
            setError('Room created but failed to auto-join. Please join manually.');
            setIsJoin(true);
          }
        } else {
          router.push(`/room/${roomName.toLowerCase()}`);
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* Header icon removed as requested */}
      </header>

      <main className={styles.main}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.hero}
        >
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <img 
              src="/icon.png" 
              alt="" 
              width={80} 
              height={80} 
              style={{ objectFit: 'contain' }}
            />
            <img 
              src="/logo-title.png" 
              alt="CopyCode - Share code & text instantly" 
              className={styles.titleLogo}
              style={{ maxHeight: '80px' }}
            />
          </h1>
          <p className={styles.subtitle}>
            Secure, password-protected rooms for seamless data transfer across all your devices.
          </p>
        </motion.div>

        <div className={styles.formSection}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${isJoin ? styles.activeTab : ''}`}
              onClick={() => setIsJoin(true)}
            >
              <LogIn size={18} /> Join Room
            </button>
            <button 
              className={`${styles.tab} ${!isJoin ? styles.activeTab : ''}`}
              onClick={() => setIsJoin(false)}
            >
              <Plus size={18} /> Create Room
            </button>
          </div>

          <motion.div 
            key={isJoin ? 'join' : 'create'}
            initial={{ opacity: 0, x: isJoin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
          >
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Room Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. dev-session" 
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Enter room password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {error && <p className={styles.error}>{error}</p>}
              
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '14px', marginTop: '1rem', width: '100%', fontSize: '1.1rem' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : isJoin ? 'Join Room' : 'Create Room'}
              </button>
            </form>
          </motion.div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <ShieldCheck className={styles.featureIcon} />
            <h3>Secure</h3>
            <p>Hashed passwords and encrypted sessions.</p>
          </div>
          <div className={styles.feature}>
            <Zap className={styles.featureIcon} />
            <h3>Fast</h3>
            <p>Instant synchronization across devices.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 CopyCode. All rights reserved.</p>
      </footer>
    </div>
  );
}
