import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag, AlertCircle, ListChecks, CheckCircle2 } from 'lucide-react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  User, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp, 
  writeBatch,
  getDocFromServer,
  OperationType,
  handleFirestoreError
} from './firebase';

import { ShoppingItem, ItemCategory, QuickAddItem, QUICK_SUGGESTIONS, normalizeCategory } from './types';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { AddItemForm } from './components/AddItemForm';
import { ShoppingListItem } from './components/ShoppingListItem';
import { CompletedSection } from './components/CompletedSection';
import { CategoryFilter } from './components/CategoryFilter';
import { FamilyShareModal } from './components/FamilyShareModal';
import { QuickAddManager } from './components/QuickAddManager';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Shopping List items from Firestore
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [joinNotification, setJoinNotification] = useState<string | null>(null);

  // Filters & Family group state
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [familyGroup, setFamilyGroup] = useState<string>(() => {
    return localStorage.getItem('shopping_family_group') || 'default_family';
  });
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  // Quick Add items state from Firestore
  const [quickItems, setQuickItems] = useState<QuickAddItem[]>([]);

  // Check URL query parameters on load for ?group= or ?join=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupFromUrl = params.get('group') || params.get('join');
    if (groupFromUrl && groupFromUrl.trim()) {
      const cleanGroup = groupFromUrl.trim();
      setFamilyGroup(cleanGroup);
      localStorage.setItem('shopping_family_group', cleanGroup);
      setJoinNotification(`「${cleanGroup}」の家族グループに参加しました`);
      setTimeout(() => setJoinNotification(null), 4000);
    }
  }, []);

  // Validate connection to Firestore on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'users', 'connection-check'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firestore client is offline, please check network connection.');
        }
      }
    }
    testConnection();
  }, []);

  // 1. Firebase Authentication Listener & User Settings Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setIsLoadingAuth(false);

        if (currentUser) {
          // If URL parameter had set a group, save it to Firestore profile
          const params = new URLSearchParams(window.location.search);
          const groupFromUrl = params.get('group') || params.get('join');
          if (groupFromUrl && groupFromUrl.trim()) {
            try {
              await setDoc(doc(db, 'users', currentUser.uid), { familyGroup: groupFromUrl.trim() }, { merge: true });
            } catch (e) {
              // Non-blocking
            }
          }

          // Sync familyGroup setting across devices for this account
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const unsubscribeUser = onSnapshot(
              userDocRef, 
              (docSnap) => {
                if (docSnap.exists() && docSnap.data().familyGroup) {
                  const cloudFamily = docSnap.data().familyGroup;
                  setFamilyGroup(cloudFamily);
                  localStorage.setItem('shopping_family_group', cloudFamily);
                }
              },
              (err) => {
                handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
              }
            );
            return () => unsubscribeUser();
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`);
          }
        }
      },
      (error) => {
        console.error('Auth state error:', error);
        setAuthError(error.message);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listener for Quick Add Items
  useEffect(() => {
    if (!user) {
      setQuickItems([]);
      return;
    }

    const quickCollection = collection(db, 'quick_add_items');
    const q = query(
      quickCollection,
      where('familyGroup', '==', familyGroup),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const defaultItems: QuickAddItem[] = QUICK_SUGGESTIONS.map((s, idx) => ({
            id: `default-${idx}`,
            text: s.text,
            category: s.category,
            familyGroup: familyGroup,
          }));
          setQuickItems(defaultItems);
        } else {
          const list: QuickAddItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              text: data.text || '',
              category: normalizeCategory(data.category),
              familyGroup: data.familyGroup || 'default_family',
              createdAt: data.createdAt || null,
            };
          });
          setQuickItems(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'quick_add_items');
        const fallbackQ = query(quickCollection, where('familyGroup', '==', familyGroup));
        const unsubFallback = onSnapshot(
          fallbackQ, 
          (snapshot) => {
            if (snapshot.empty) {
              const defaultItems: QuickAddItem[] = QUICK_SUGGESTIONS.map((s, idx) => ({
                id: `default-${idx}`,
                text: s.text,
                category: s.category,
                familyGroup: familyGroup,
              }));
              setQuickItems(defaultItems);
            } else {
              const list: QuickAddItem[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id,
                  text: data.text || '',
                  category: (data.category as ItemCategory) || 'その他',
                  familyGroup: data.familyGroup || 'default_family',
                  createdAt: data.createdAt || null,
                };
              });
              setQuickItems(list);
            }
          },
          (err2) => {
            handleFirestoreError(err2, OperationType.LIST, 'quick_add_items_fallback');
          }
        );
        return () => unsubFallback();
      }
    );

    return () => unsubscribe();
  }, [user, familyGroup]);

  // Save family group code in localStorage and Firestore for multi-device auto sync
  const handleUpdateFamilyGroup = async (newCode: string) => {
    setFamilyGroup(newCode);
    localStorage.setItem('shopping_family_group', newCode);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { familyGroup: newCode }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  // 2. Real-time Firestore Listener (onSnapshot)
  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoadingItems(false);
      return;
    }

    setIsLoadingItems(true);
    setIsSyncing(true);
    setFirestoreError(null);

    const itemsCollection = collection(db, 'shopping_items');
    
    // Query items for this family group sorted by creation date
    const q = query(
      itemsCollection,
      where('familyGroup', '==', familyGroup),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ShoppingItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            text: data.text || '',
            completed: Boolean(data.completed),
            createdAt: data.createdAt || null,
            userId: data.userId || '',
            userName: data.userName || '',
            userPhoto: data.userPhoto || '',
            category: normalizeCategory(data.category),
            quantity: data.quantity || '',
            familyGroup: data.familyGroup || 'default_family',
          };
        });

        setItems(list);
        setIsLoadingItems(false);
        setIsSyncing(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'shopping_items');
        // Fallback query without composite index if order fails
        const fallbackQ = query(itemsCollection, where('familyGroup', '==', familyGroup));
        const fallbackUnsub = onSnapshot(
          fallbackQ,
          (fallbackSnapshot) => {
            const list: ShoppingItem[] = fallbackSnapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                text: data.text || '',
                completed: Boolean(data.completed),
                createdAt: data.createdAt || null,
                userId: data.userId || '',
                userName: data.userName || '',
                userPhoto: data.userPhoto || '',
                category: normalizeCategory(data.category),
                quantity: data.quantity || '',
                familyGroup: data.familyGroup || 'default_family',
              };
            });
            // Client-side sort fallback
            list.sort((a, b) => {
              const tA = (a.createdAt as any)?.seconds || 0;
              const tB = (b.createdAt as any)?.seconds || 0;
              return tB - tA;
            });
            setItems(list);
            setIsLoadingItems(false);
            setIsSyncing(false);
          },
          (err2) => {
            handleFirestoreError(err2, OperationType.LIST, 'shopping_items_fallback');
            setFirestoreError('データのリアルタイム同期に失敗しました。');
            setIsLoadingItems(false);
            setIsSyncing(false);
          }
        );

        return () => fallbackUnsub();
      }
    );

    return () => unsubscribe();
  }, [user, familyGroup]);

  // Audio haptic tap feedback when checking off items
  const playTapSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext not allowed before user interaction, silent ignore
    }
  };

  // 3. Firestore Action Handlers
  const handleAddItem = async (text: string, category?: ItemCategory, quantity?: string) => {
    if (!user) return;
    setIsSubmitting(true);
    setFirestoreError(null);

    try {
      await addDoc(collection(db, 'shopping_items'), {
        text,
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || '家族',
        userPhoto: user.photoURL || '',
        category: category || 'その他',
        quantity: quantity || '',
        familyGroup: familyGroup,
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'shopping_items');
      setFirestoreError('アイテムの追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id: string, currentCompleted: boolean) => {
    setIsUpdating(true);
    if (!currentCompleted) playTapSound();

    try {
      const itemRef = doc(db, 'shopping_items', id);
      await updateDoc(itemRef, {
        completed: !currentCompleted,
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `shopping_items/${id}`);
      setFirestoreError('状態の更新に失敗しました。');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setIsUpdating(true);
    try {
      const itemRef = doc(db, 'shopping_items', id);
      await deleteDoc(itemRef);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `shopping_items/${id}`);
      setFirestoreError('アイテムの削除に失敗しました。');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearAllCompleted = async () => {
    setIsUpdating(true);
    try {
      const completedList = items.filter((item) => item.completed);
      const batch = writeBatch(db);
      completedList.forEach((item) => {
        batch.delete(doc(db, 'shopping_items', item.id));
      });
      await batch.commit();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, 'shopping_items/batch');
      setFirestoreError('一括削除に失敗しました。');
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Add Item Action Handlers
  const handleAddQuickItem = async (text: string, category: ItemCategory) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'quick_add_items'), {
        text,
        category,
        familyGroup,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'quick_add_items');
      setFirestoreError('ワンタップ品目の追加に失敗しました。');
    }
  };

  const handleDeleteQuickItem = async (id: string) => {
    if (id.startsWith('default-')) {
      setQuickItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    try {
      await deleteDoc(doc(db, 'quick_add_items', id));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `quick_add_items/${id}`);
      setFirestoreError('ワンタップ品目の削除に失敗しました。');
    }
  };

  const handleRestoreDefaultQuickItems = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      QUICK_SUGGESTIONS.forEach((s) => {
        const newRef = doc(collection(db, 'quick_add_items'));
        batch.set(newRef, {
          text: s.text,
          category: s.category,
          familyGroup,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'quick_add_items/batch_restore');
      setFirestoreError('デフォルト品目の復元に失敗しました。');
    }
  };

  // 4. Filtering items based on category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeItems = filteredItems.filter((i) => !i.completed);
  const completedItems = filteredItems.filter((i) => i.completed);
  const totalActiveCount = items.filter((i) => !i.completed).length;

  // Initial Auth Loading Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-medium">買い物リストを起動中...</p>
      </div>
    );
  }

  // Render Login Screen if not logged in
  if (!user) {
    return <LoginView isLoading={isLoadingAuth} error={authError} setError={setAuthError} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 pb-16 font-sans">
      {/* Top Navigation Bar */}
      <Header
        user={user}
        familyGroup={familyGroup}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        isSyncing={isSyncing}
      />

      <main className="max-w-xl mx-auto px-3.5 sm:px-4 pt-4 space-y-4">
        {/* Join notification toast */}
        {joinNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{joinNotification}</span>
            </div>
            <button
              onClick={() => setJoinNotification(null)}
              className="text-xs text-emerald-700 underline cursor-pointer"
            >
              閉じる
            </button>
          </motion.div>
        )}

        {/* Firestore error banner if present */}
        {firestoreError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{firestoreError}</span>
            </div>
            <button
              onClick={() => setFirestoreError(null)}
              className="text-xs underline text-rose-600 font-medium ml-2 cursor-pointer"
            >
              閉じる
            </button>
          </div>
        )}

        {/* Add Item Form */}
        <AddItemForm onAddItem={handleAddItem} isSubmitting={isSubmitting} quickItems={quickItems} />

        {/* Category & Search Filter Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCount={totalActiveCount}
        />

        {/* Shopping List Container */}
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <ListChecks className="w-4 h-4 text-sky-600" />
              <span>買うもの ({activeItems.length}件)</span>
            </div>

            {totalActiveCount === 0 && items.length > 0 && (
              <span className="text-[11px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-full">
                🎉 すべて購入完了！
              </span>
            )}
          </div>

          {/* Loading items state */}
          {isLoadingItems ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">リストを更新中...</p>
            </div>
          ) : activeItems.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-xs"
            >
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">
                {searchQuery || selectedCategory !== 'ALL'
                  ? '該当するアイテムがありません'
                  : '買うものはすべて揃っています！'}
              </h3>
              <p className="text-xs text-slate-400">
                {searchQuery || selectedCategory !== 'ALL'
                  ? '検索条件やカテゴリを変更してみてください'
                  : 'フォームから買うものを追加してみましょう'}
              </p>
            </motion.div>
          ) : (
            /* Active Shopping Items List */
            <div className="space-y-2">
              <AnimatePresence>
                {activeItems.map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    onDeleteItem={handleDeleteItem}
                    isUpdating={isUpdating}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Completed Items Section */}
          <CompletedSection
            completedItems={completedItems}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteItem}
            onClearAllCompleted={handleClearAllCompleted}
            isUpdating={isUpdating}
          />

          {/* Quick Add Manager Section (Below the List) */}
          <QuickAddManager
            quickItems={quickItems}
            onAddQuickItem={handleAddQuickItem}
            onDeleteQuickItem={handleDeleteQuickItem}
            onRestoreDefaults={handleRestoreDefaultQuickItems}
            onAddShoppingItem={handleAddItem}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>

      {/* Family Group Share Modal */}
      <FamilyShareModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        currentFamilyGroup={familyGroup}
        onUpdateFamilyGroup={handleUpdateFamilyGroup}
      />
    </div>
  );
}
