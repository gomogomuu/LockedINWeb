import React, { useState } from 'react';
import './App.css';

const INITIAL_TASKS = [
  { 
    id: 1, title: 'RMCS', time: '9 AM', day: 3, weekOffset: 0, color: 'c-blue', category: 'Academic',
    description: 'Cicil Bab 4.'
  },
  { 
    id: 2, title: 'Tugas AOL COMPBIO', time: '10 AM', day: 6, weekOffset: 0, color: 'c-darkblue', category: 'Groups',
    description: 'Kumpulkan di Binus Maya.'
  }
];

const INITIAL_THREADS = [
  { 
    id: 1, 
    title: 'Tugas AOL COMPBIO',
    author: 'James#1211', 
    text: 'Tugas nya deadline tanggal 17 ya teman teman mohon kerjasamanya.', 
    deadlinePassed: false,
    tasksAllocated: [
      { name: 'James#1211', role: 'Leader', taskType: 'Coding', weight: 50, completed: false, approvedByLeader: false },
      { name: 'George#4431', role: 'Member 1', taskType: 'Laporan', weight: 30, completed: false, approvedByLeader: false },
      { name: 'Geronimo#2880', role: 'Member 2', taskType: 'Karya Ilmiah', weight: 20, completed: false, approvedByLeader: false }
    ],
    replies: [
      { id: 101, author: 'Geronimo#2880', text: 'Saya sudah mengumpulkan progress bab 1 bagian pendahuluan ya ketua.', taskType: 'Karya Ilmiah', file: null, status: 'Pending Verification' }
    ] 
  }
];

const HOURS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'];

const WEEKS_DATA = {
  [-1]: [
    { name: 'Mon', date: 5, id: 1 }, { name: 'Tue', date: 6, id: 2 }, { name: 'Wed', date: 7, id: 3 },
    { name: 'Thu', date: 8, id: 4 }, { name: 'Fri', date: 9, id: 5 }, { name: 'Sat', date: 10, id: 6 }, { name: 'Sun', date: 11, id: 7 }
  ],
  0: [
    { name: 'Mon', date: 12, id: 1 }, { name: 'Tue', date: 13, id: 2 }, { name: 'Wed', date: 14, id: 3 },
    { name: 'Thu', date: 15, id: 4 }, { name: 'Fri', date: 16, id: 5, isToday: true }, { name: 'Sat', date: 17, id: 6 }, { name: 'Sun', date: 18, id: 7 }
  ],
  1: [
    { name: 'Mon', date: 19, id: 1 }, { name: 'Tue', date: 20, id: 2 }, { name: 'Wed', date: 21, id: 3 },
    { name: 'Thu', date: 22, id: 4 }, { name: 'Fri', date: 23, id: 5 }, { name: 'Sat', date: 24, id: 6 }, { name: 'Sun', date: 25, id: 7 }
  ]
};

const MONTH_LABELS = {
  [-1]: 'January 2026 (Prev Week)',
  0: 'January 2026',
  1: 'January 2026 (Next Week)'
};

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');

  // --- CORE APP STATES ---
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  const [showFriendBox, setShowFriendBox] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [friendsList, setFriendsList] = useState(['George#4431', 'Gero#0001', 'James#1211', 'Bond#0007', 'Geronimo#2880']);

  const [selectedTask, setSelectedTask] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);       
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [addModal, setAddModal] = useState(null); 
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Groups');

  const [showThreadModal, setShowThreadModal] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [threadForm, setThreadForm] = useState({
    title: '', text: '',
    member1_name: '', member1_task: '', member1_weight: '',
    member2_name: '', member2_task: '', member2_weight: '',
    member3_name: '', member3_task: '', member3_weight: ''
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');

  // --- HANDLE LOGIN SUBMIT ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setCurrentUser(usernameInput.trim());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput('');
  };

  const handlePrevWeek = () => { if (currentWeekOffset > -1) setCurrentWeekOffset(currentWeekOffset - 1); };
  const handleNextWeek = () => { if (currentWeekOffset < 1) setCurrentWeekOffset(currentWeekOffset + 1); };

  const handleSaveNewEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const colorMap = { Groups: 'c-darkblue', Academic: 'c-blue', Public: 'c-purple' };
    setTasks([...tasks, {
      id: Date.now(), title: newTitle.trim(), description: newDesc.trim(),
      time: addModal.hour, day: addModal.day, weekOffset: currentWeekOffset,
      color: colorMap[newCategory] || 'c-gray', category: newCategory
    }]);
    setNewTitle(''); setNewDesc(''); setAddModal(null);
  };

  const handleOpenViewModal = (task) => {
    setSelectedTask(task); setEditTitle(task.title); setEditDesc(task.description || ''); setIsEditing(false);
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, title: editTitle.trim(), description: editDesc.trim() } : t));
    setSelectedTask(null); setIsEditing(false);
  };

  const triggerDeleteConfirmation = (type, id) => {
    setDeleteTarget({ type, id });
  };

  const confirmDeleteAction = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'task') {
      setTasks(tasks.filter(t => t.id !== deleteTarget.id));
      setSelectedTask(null);
      setIsEditing(false);
    } else if (deleteTarget.type === 'thread') {
      setThreads(threads.filter(th => th.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleSaveThread = (e) => {
    e.preventDefault();
    if (!threadForm.title.trim() || !threadForm.text.trim()) return;

    const membersArray = [threadForm.member1_name, threadForm.member2_name, threadForm.member3_name];
    const uniqueMembers = new Set(membersArray.filter(name => name.trim() !== ''));
    if (uniqueMembers.size !== membersArray.filter(name => name.trim() !== '').length) {
      setValidationError("Sistem Menolak: Anggota tim yang dipilih di dalam project thread tidak boleh kembar!");
      return;
    }

    const totalWeight = Number(threadForm.member1_weight) + Number(threadForm.member2_weight) + Number(threadForm.member3_weight);
    if (totalWeight !== 100) {
      setValidationError(`Sistem Menolak: Total kalkulasi bobot kontribusi tim harus pas 100%! (Saat ini: ${totalWeight}%)`);
      return;
    }

    const tasksAllocated = [
      { name: threadForm.member1_name || 'Unassigned', role: 'Leader', taskType: threadForm.member1_task || 'Coding', weight: Number(threadForm.member1_weight), completed: false, approvedByLeader: false },
      { name: threadForm.member2_name || 'Unassigned', role: 'Member 1', taskType: threadForm.member2_task || 'Laporan', weight: Number(threadForm.member2_weight), completed: false, approvedByLeader: false },
      { name: threadForm.member3_name || 'Unassigned', role: 'Member 2', taskType: threadForm.member3_task || 'Karya Ilmiah', weight: Number(threadForm.member3_weight), completed: false, approvedByLeader: false }
    ];

    if (editingThreadId) {
      setThreads(threads.map(t => t.id === editingThreadId ? { ...t, title: threadForm.title, text: threadForm.text, tasksAllocated } : t));
      setEditingThreadId(null);
    } else {
      setThreads([{
        id: Date.now(), title: threadForm.title, author: currentUser, text: threadForm.text, deadlinePassed: false, tasksAllocated, replies: []
      }, ...threads]);
    }
    setShowThreadModal(false);
    resetThreadForm();
  };

  const handleEditThreadTrigger = (thread) => {
    setEditingThreadId(thread.id);
    setThreadForm({
      title: thread.title, text: thread.text,
      member1_name: thread.tasksAllocated[0].name, member1_task: thread.tasksAllocated[0].taskType, member1_weight: thread.tasksAllocated[0].weight,
      member2_name: thread.tasksAllocated[1].name, member2_task: thread.tasksAllocated[1].taskType, member2_weight: thread.tasksAllocated[1].weight,
      member3_name: thread.tasksAllocated[2].name, member3_task: thread.tasksAllocated[2].taskType, member3_weight: thread.tasksAllocated[2].weight
    });
    setShowThreadModal(true);
  };

  const resetThreadForm = () => {
    setThreadForm({
      title: '', text: '',
      member1_name: '', member1_task: '', member1_weight: '',
      member2_name: '', member2_task: '', member2_weight: '',
      member3_name: '', member3_task: '', member3_weight: ''
    });
  };

  const handleOpenReplyBox = (thread) => {
    setReplyToId(replyToId === thread.id ? null : thread.id);
    if (thread.tasksAllocated && thread.tasksAllocated.length > 0) {
      setSelectedTaskType(thread.tasksAllocated[0].taskType);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReplyFile(e.target.files[0].name);
    }
  };

  const handleAddReply = (threadId) => {
    const cleanText = replyText.trim();
    const cleanFile = replyFile.trim();

    if (!cleanText && !cleanFile) {
      setValidationError("Please enter a work description or attach a supporting file.");
      return;
    }

    setThreads(threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          replies: [...t.replies, {
            id: Date.now(), 
            author: currentUser, 
            text: cleanText || null, 
            taskType: selectedTaskType || t.tasksAllocated[0].taskType, 
            file: cleanFile || null, 
            status: 'Pending Verification'
          }]
        };
      }
      return t;
    }));

    setReplyText(''); 
    setReplyFile(''); 
    setReplyToId(null);
  };

  const handleDownloadFile = (fileName, taskType) => {
    if (!fileName) return;
    const fileContent = `// LockedIn Smart Tracker\n// Task: ${taskType}\n// File: ${fileName}`;
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleVerifyContribution = (threadId, replyId, taskType, isApproved) => {
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        const updatedReplies = t.replies.map(r => r.id === replyId ? { ...r, status: isApproved ? 'Approved' : 'Rejected' } : r);
        const updatedTasks = t.tasksAllocated.map(task => {
          const isMatch = task.taskType.trim().toLowerCase() === taskType.trim().toLowerCase();
          return isMatch ? { ...task, completed: isApproved, approvedByLeader: isApproved } : task;
        });
        return { ...t, replies: updatedReplies, tasksAllocated: updatedTasks };
      }
      return t;
    }));
  };

  const handleTakeoverTask = (threadId, taskType) => {
    const replacement = prompt("Select a new team member from your friend list:");
    if (!replacement) return;
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        return { ...t, tasksAllocated: t.tasksAllocated.map(task => task.taskType === taskType ? { ...task, name: replacement, completed: false, approvedByLeader: false } : task) };
      }
      return t;
    }));
  };

  const activeDays = WEEKS_DATA[currentWeekOffset] || WEEKS_DATA[0];

  if (!currentUser) {
    return (
      <div className="login-screen-overlay">
        <div className="login-card-container">
          <div className="login-brand-header">
            {/* Menggunakan file image_4f5982.png sebagai logo utama */}
            <img src="/image_4f5982.png" alt="LockedIn Logo" className="login-logo-img" />
            <p>Academic & Group Matrix Task Core Tracker</p>
          </div>
          <form onSubmit={handleLoginSubmit} className="login-form-element">
            <div className="form-group">
              <label>Discord Username / Client Tag</label>
              <input 
                type="text" 
                value={usernameInput} 
                onChange={(e) => setUsernameInput(e.target.value)} 
                placeholder="Contoh: Geronimo#2880"
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary btn-full-width">Log In 🚀</button>
          </form>
          <div className="quick-test-accounts">
            <label>Quick Select Account:</label>
            <div className="quick-badges-row">
              <span onClick={() => setUsernameInput('Geronimo#2880')}>Geronimo#2880 (Leader)</span>
              <span onClick={() => setUsernameInput('James#1211')}>James#1211</span>
              <span onClick={() => setUsernameInput('George#4431')}>George#4431</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UTAMA JIKA SUDAH LOGIN ---
  return (
    <div className="lockedin-dashboard">
      <div className="calendar-section">
        <header className="cal-header">
          <div className="cal-title-section">
            <div className="cal-today-badge">
              <span className="cal-month-short">JAN</span>
              <span className="cal-date-num">18</span>
            </div>
            <div className="cal-current-date">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2>{MONTH_LABELS[currentWeekOffset]}</h2>
                <div className="arrow-nav-group">
                  <button className="btn-nav-arrow" onClick={handlePrevWeek}>◀</button>
                  <button className="btn-nav-arrow" onClick={handleNextWeek}>▶</button>
                </div>
              </div>
              <p>Active Session Identity: <strong style={{ color: 'var(--primary-accent)' }}>{currentUser}</strong></p>
            </div>
          </div>

          <div className="friend-manager-area" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-add-friend-trigger" onClick={() => setShowFriendBox(!showFriendBox)}>
              👥 Friends ({friendsList.length})
            </button>
            <button className="btn-mini-action btn-del" style={{ padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold' }} onClick={handleLogout}>
              🚪 Logout
            </button>
            {showFriendBox && (
              <div className="friend-dropdown-box">
                <h4>Add Friend (Discord Tag)</h4>
                <form onSubmit={(e) => { e.preventDefault(); if(friendInput.includes('#')) { setFriendsList([...friendsList, friendInput.trim()]); setFriendInput(''); } }} className="friend-form-mini">
                  <input type="text" placeholder="User#0000" value={friendInput} onChange={(e) => setFriendInput(e.target.value)} required />
                  <button type="submit">Add</button>
                </form>
                <div className="friend-list-scroller">
                  {friendsList.map(f => <div key={f} className="friend-item-row">🟢 {f}</div>)}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="cal-grid-wrapper">
          <div className="cal-grid">
            <div className="time-col-header"></div>
            {activeDays.map(day => (
              <div key={day.date} className={`day-header ${day.isToday && currentWeekOffset === 0 ? 'current-day' : ''}`}>
                {day.name} {day.date}
              </div>
            ))}

            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="time-label">{hour}</div>
                {activeDays.map(day => {
                  const currentTask = tasks.find(t => t.time === hour && t.day === day.id && t.weekOffset === currentWeekOffset);
                  return (
                    <div key={day.id} className="grid-cell" onClick={() => !currentTask && setAddModal({ hour, day: day.id })}>
                      {currentTask && (
                        <div className={`event-card ${currentTask.color}`} onClick={(e) => { e.stopPropagation(); handleOpenViewModal(currentTask); }}>
                          {currentTask.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {currentWeekOffset === 0 && <div className="current-time-line" style={{ top: '160px' }}></div>}
        </div>
      </div>

      <div className="threads-sidebar">
        <div className="sidebar-header-row">
          <h3>Group Threads</h3>
          <button className="btn-create-thread-trigger" onClick={() => { setEditingThreadId(null); resetThreadForm(); setShowThreadModal(true); }}>
            + Create New Thread
          </button>
        </div>

        <div className="twitter-feed">
          {threads.map(t => {
            const currentProgress = t.tasksAllocated.reduce((acc, curr) => curr.approvedByLeader ? acc + curr.weight : acc, 0);
            const isLeader = currentUser === t.tasksAllocated[0].name;

            return (
              <div key={t.id} className="tweet-container">
                <div className="tweet-main" style={{ display: 'flex' }}>
                  <div className="tweet-avatar">{t.author[0]}</div>
                  <div className="tweet-body">
                    <div className="thread-meta-top">
                      <span className="tweet-author">@{t.author}</span>
                      <div className="thread-crud-actions">
                        <button className="btn-mini-action" onClick={() => handleEditThreadTrigger(t)}>✏️ Edit</button>
                        <button className="btn-mini-action btn-del" onClick={() => triggerDeleteConfirmation('thread', t.id)}>❌ Delete</button>
                      </div>
                    </div>
                    <h4 className="thread-render-title">{t.title}</h4>
                    <p className="tweet-text-content">{t.text}</p>
                    
                    <div className="accountability-allocation-box">
                      <h5>📋 Task Contribution Matrix</h5>
                      {t.tasksAllocated.map(member => (
                        <div key={member.taskType} className="matrix-row-item">
                          <div>
                            <strong>{member.name}</strong> <span className="sub-role">({member.role})</span>
                            <div className="matrix-task-desc">Tugas: {member.taskType} ({member.weight}%)</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`status-tag ${member.approvedByLeader ? 'done' : 'pending'}`}>
                              {member.approvedByLeader ? '✓ Verified' : '⏳ Pending'}
                            </span>
                            {!member.approvedByLeader && t.deadlinePassed && (
                              <button className="btn-takeover" onClick={() => handleTakeoverTask(t.id, member.taskType)}>Takeover</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="leader-control-panel">
                      <div className="panel-header-sim">
                        <h5>📊 Live Progress Tracking</h5>
                        <button className={`btn-sim-deadline ${t.deadlinePassed ? 'active' : ''}`} onClick={() => setThreads(threads.map(th => th.id === t.id ? {...th, deadlinePassed: !th.deadlinePassed} : th))}>
                          {t.deadlinePassed ? '⚠️ Passed Deadline' : '⏰ Live Mode'}
                        </button>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${currentProgress}%` }}></div>
                        <span className="progress-text">Total Progress Kelompok: {currentProgress}% / 100%</span>
                      </div>
                    </div>

                    <button className="btn-reply" onClick={() => handleOpenReplyBox(t)}>
                      💬 Reply Contribution
                    </button>
                  </div>
                </div>
                
                <div className="tweet-replies">
                  {t.replies.map(r => (
                    <div key={r.id} className="reply-item-advanced">
                      <div className="reply-meta-line">
                        <span className="reply-author">@{r.author}</span>
                        <span className="reply-task-tag">🎯 Working on: {r.taskType}</span>
                      </div>
                      
                      {r.text && <p className="reply-text-content">{r.text}</p>}
                      
                      {r.file && (
                        <div className="reply-file-attached">
                          📦 Attached File:{' '}
                          {r.status === 'Approved' ? (
                            <button className="btn-download-link" onClick={() => handleDownloadFile(r.file, r.taskType)}>
                              {r.file} 📥 (Download)
                            </button>
                          ) : (
                            <span>{r.file}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="leader-verification-bar">
                        <span className={`verification-status ${r.status === 'Approved' ? 'approved' : r.status === 'Rejected' ? 'rejected' : 'pending'}`}>
                          {r.status}
                        </span>
                        {r.status === 'Pending Verification' && (
                          <div className="action-verify-buttons">
                            <button 
                              className="btn-v-approve" 
                              onClick={() => handleVerifyContribution(t.id, r.id, r.taskType, true)}
                              disabled={!isLeader}
                              title={isLeader ? "Approve Contribution" : "Hanya Project Leader yang memiliki hak akses verifikasi!"}
                              style={{ opacity: isLeader ? 1 : 0.4, cursor: isLeader ? 'pointer' : 'not-allowed' }}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn-v-reject" 
                              onClick={() => handleVerifyContribution(t.id, r.id, r.taskType, false)}
                              disabled={!isLeader}
                              title={isLeader ? "Reject Contribution" : "Hanya Project Leader yang memiliki hak akses verifikasi!"}
                              style={{ opacity: isLeader ? 1 : 0.4, cursor: isLeader ? 'pointer' : 'not-allowed' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {replyToId === t.id && (
                    <div className="reply-input-box-advanced">
                      <div className="reply-select-task-row">
                        <label>Pilih Komponen Tugas Anda:</label>
                        <select value={selectedTaskType} onChange={(e) => setSelectedTaskType(e.target.value)}>
                          {t.tasksAllocated.map(m => (
                            <option key={m.taskType} value={m.taskType}>{m.taskType} ({m.weight}%)</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <input 
                          type="text" 
                          placeholder="Deskripsikan pengerjaan Anda di sini..." 
                          value={replyText} 
                          onChange={(e) => setReplyText(e.target.value)} 
                          style={{ flex: 1 }}
                        />
                        <label className="file-attach-icon-btn" style={{ cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}>
                          📎
                          <input 
                            type="file" 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>

                      {replyFile && (
                        <div style={{ fontSize: '12px', color: 'var(--success-green)', marginTop: '4px' }}>
                          Selected file: {replyFile}
                        </div>
                      )}

                      <div className="reply-uploader-bar" style={{ marginTop: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn-send-reply" onClick={() => handleAddReply(t.id)}>Submit Progress</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showThreadModal && (
        <div className="modal-overlay" onClick={() => setShowThreadModal(false)}>
          <div className="modal-content advanced-thread-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{editingThreadId ? 'Edit Core Task Thread' : 'Create New Core Task Thread'}</h3>
              <button className="btn-close" onClick={() => setShowThreadModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveThread}>
              <div className="form-group">
                <label>Thread Title / Task Name</label>
                <input type="text" value={threadForm.title} onChange={(e) => setThreadForm({...threadForm, title: e.target.value})} placeholder=" " required />
              </div>
              <div className="form-group">
                <label>Main Instructions</label>
                <textarea value={threadForm.text} onChange={(e) => setThreadForm({...threadForm, text: e.target.value})} placeholder=" " required />
              </div>
              
              <div className="form-group team-allocation-vertical">
                <label>Assign Team Members (Total Wajib 100% - Pilih {currentUser} jika ingin menjadi leader)</label>
                
                <div className="member-allocation-card">
                  <span className="allocation-role-badge leader">Project Leader</span>
                  <div className="allocation-row-inputs">
                    <select value={threadForm.member1_name} onChange={(e) => setThreadForm({...threadForm, member1_name: e.target.value})} required>
                      <option value="">-- Choose Leader --</option>
                      <option value={currentUser}>{currentUser} (You)</option>
                      {friendsList.filter(f => f !== currentUser).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <input type="text" value={threadForm.member1_task} onChange={(e) => setThreadForm({...threadForm, member1_task: e.target.value})} placeholder="" required />
                    <div className="input-with-unit">
                      <input type="number" value={threadForm.member1_weight} onChange={(e) => setThreadForm({...threadForm, member1_weight: e.target.value})} placeholder="" required />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <div className="member-allocation-card">
                  <span className="allocation-role-badge">Member 1</span>
                  <div className="allocation-row-inputs">
                    <select value={threadForm.member2_name} onChange={(e) => setThreadForm({...threadForm, member2_name: e.target.value})} required>
                      <option value="">-- Choose Member --</option>
                      <option value={currentUser}>{currentUser} (You)</option>
                      {friendsList.filter(f => f !== currentUser).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <input type="text" value={threadForm.member2_task} onChange={(e) => setThreadForm({...threadForm, member2_task: e.target.value})} placeholder="" required />
                    <div className="input-with-unit">
                      <input type="number" value={threadForm.member2_weight} onChange={(e) => setThreadForm({...threadForm, member2_weight: e.target.value})} placeholder="" required />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <div className="member-allocation-card">
                  <span className="allocation-role-badge">Member 2</span>
                  <div className="allocation-row-inputs">
                    <select value={threadForm.member3_name} onChange={(e) => setThreadForm({...threadForm, member3_name: e.target.value})} required>
                      <option value="">-- Choose Member --</option>
                      <option value={currentUser}>{currentUser} (You)</option>
                      {friendsList.filter(f => f !== currentUser).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <input type="text" value={threadForm.member3_task} onChange={(e) => setThreadForm({...threadForm, member3_task: e.target.value})} placeholder="" required />
                    <div className="input-with-unit">
                      <input type="number" value={threadForm.member3_weight} onChange={(e) => setThreadForm({...threadForm, member3_weight: e.target.value})} placeholder="" required />
                      <span>%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-text" onClick={() => setShowThreadModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingThreadId ? 'Save Changes' : 'Post Core Thread 🚀'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay" onClick={() => { setSelectedTask(null); setIsEditing(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateEvent}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditing ? (
                  <input className="edit-modal-input-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                ) : (
                  <h3>{selectedTask.title}</h3>
                )}
                <button type="button" className="btn-close" onClick={() => { setSelectedTask(null); setIsEditing(false); }}>×</button>
              </div>
              <div className="modal-body" style={{ margin: '14px 0' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏰ Slot Waktu: {selectedTask.time} | 🏷 Tag: {selectedTask.category}</p>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', margin: '14px 0 6px 0' }}>Deskripsi Utama Tugas:</label>
                {isEditing ? (
                  <textarea className="edit-modal-textarea" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required />
                ) : (
                  <p className="view-modal-desc-text">{selectedTask.description || 'Tidak ada deskripsi pengerjaan.'}</p>
                )}
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <button type="button" className="btn-text" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-text" onClick={() => setIsEditing(true)}>✏ Edit Details</button>
                    <button type="button" className="btn-danger-action" onClick={() => triggerDeleteConfirmation('task', selectedTask.id)}>❌ Delete</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {addModal && (
        <div className="modal-overlay" onClick={() => setAddModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Task at {addModal.hour}</h3>
            <form onSubmit={handleSaveNewEvent}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder=" " autoFocus required />
              </div>
              <div className="form-group">
                <label>Description Matrix</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder=" " required style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '6px', height: '80px', resize: 'none' }} />
              </div>
              <div className="form-group">
                <label>Category Tag</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Groups">Groups (Dark Blue)</option>
                  <option value="Academic">Academic (Light Blue)</option>
                  <option value="Public">Public (Purple)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-text" onClick={() => setAddModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Lock In 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay custom-alert-overlay">
          <div className="modal-content custom-delete-modal">
            <h3>Confirm Deletion</h3>
            <p>
              {deleteTarget.type === 'thread' 
                ? 'Are you sure want to delete this thread?' 
                : 'Are you sure want to delete this task?'}
            </p>
            <div className="modal-actions custom-alert-actions">
              <button className="btn-text" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger-action" onClick={confirmDeleteAction}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {validationError && (
        <div className="modal-overlay custom-alert-overlay">
          <div className="modal-content custom-delete-modal">
            <h3>System Validation Alert</h3>
            <p>{validationError}</p>
            <div className="modal-actions custom-alert-actions">
              <button className="btn-primary" onClick={() => setValidationError(null)}>Ok, I Understand</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}