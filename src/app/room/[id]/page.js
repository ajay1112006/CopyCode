'use client';
 
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  LogOut, 
  Plus, 
  X,
  FileText,
  Share2,
  Clock,
  Shield,
  ArrowLeft
} from 'lucide-react';
import styles from './room.module.css';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.id;

  const [pages, setPages] = useState([{ title: 'Main', content: '' }]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [copied, setCopied] = useState(false);

  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch content on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomName}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pages && data.pages.length > 0) {
            setPages(data.pages);
          }
        } else if (res.status === 401) {
          router.push('/');
        } else {
          setError('Failed to load room content');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomName, router]);

  // Save pages function
  const savePages = useCallback(async (currentPages) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: currentPages }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSaved(new Date(data.updatedAt));
      } else {
        console.error('Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [roomName]);

  // Debounced save
  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      savePages(pages);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [pages, loading, savePages]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const newPages = [...pages];
    newPages[activePageIndex].content = newContent;
    setPages(newPages);
  };

  const startRenaming = (index, title) => {
    setEditingPageIndex(index);
    setEditingTitle(title);
  };

  const submitRename = () => {
    if (editingTitle && editingTitle.trim()) {
      const newPages = [...pages];
      newPages[editingPageIndex].title = editingTitle.trim();
      setPages(newPages);
    }
    setEditingPageIndex(null);
  };

  const addNewPage = () => {
    const newPages = [...pages, { title: 'New Page', content: '' }];
    setPages(newPages);
    setActivePageIndex(newPages.length - 1);
    setEditingPageIndex(newPages.length - 1);
    setEditingTitle('New Page');
  };

  const deletePage = (index, e) => {
    e.stopPropagation();
    if (pages.length === 1) return;
    if (!confirm('Are you sure you want to delete this page?')) return;

    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(newPages.length - 1);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pages[activePageIndex].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/rooms/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });
      router.push('/');
    } catch (err) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={styles.loader}
        />
        <p>Opening Room...</p>
      </div>
    );
  }

  const activePage = pages[activePageIndex] || pages[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/')}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.roomInfo}>
            <h1>{roomName}</h1>
            <div className={styles.status}>
              <Shield size={14} className={styles.shieldIcon} />
              <span>Secure Room</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.saveStatus}>
            {saving ? (
              <span className={styles.savingText}>Saving...</span>
            ) : lastSaved ? (
              <span className={styles.savedText}>
                <Clock size={12} /> Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <button className={styles.actionBtn} onClick={handleCopy}>
            {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className={styles.actionBtn} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <div className={styles.tabsContainer}>
        {pages.map((page, index) => (
          <div 
            key={index}
            className={`${styles.tab} ${activePageIndex === index ? styles.activeTab : ''}`}
            onClick={() => setActivePageIndex(index)}
            onDoubleClick={() => startRenaming(index, page.title)}
          >
            <FileText size={14} />
            {editingPageIndex === index ? (
              <input 
                autoFocus
                className={styles.tabInput}
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={submitRename}
                onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{page.title}</span>
            )}
            {pages.length > 1 && editingPageIndex !== index && (
              <button 
                className={styles.deletePageBtn}
                onClick={(e) => deletePage(index, e)}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <button className={styles.addPageBtn} onClick={addNewPage} title="Add Page">
          <Plus size={16} />
        </button>
      </div>

      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activePageIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.editorContainer}
          >
            <textarea
              className={styles.editor}
              value={activePage.content}
              onChange={handleContentChange}
              placeholder={`Write something in "${activePage.title}"...`}
              spellCheck={false}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInfo}>
          <Share2 size={14} />
          <span>Sharing {pages.length} page{pages.length > 1 ? 's' : ''} in this room.</span>
        </div>
      </footer>
    </div>
  );
}
