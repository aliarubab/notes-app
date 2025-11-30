(() => {
  const STORAGE_KEY = "pro_notes_v1";

  // Elements
  const form = document.getElementById("noteForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const notesList = document.getElementById("notesList");
  const emptyState = document.getElementById("emptyState");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const searchInput = document.getElementById("search");
  const clearAllBtn = document.getElementById("clearAll");

  let notes = [];         // array of {id, title, content, updatedAt}
  let editId = null;      // if non-null, we are editing this note

  // Load notes from localStorage
  function loadNotes(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      notes = raw ? JSON.parse(raw) : [];
    } catch(e) {
      notes = [];
      console.error("Failed to parse notes", e);
    }
  }

  // Save notes to localStorage
  function saveNotes(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  // Utility: create ID
  function uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  // Create a note card DOM
  function createNoteCard(note){
    const card = document.createElement("article");
    card.className = "note-card";
    card.dataset.id = note.id;

    const title = document.createElement("h3");
    title.className = "note-title";
    title.textContent = note.title || "Untitled";

    const content = document.createElement("p");
    content.className = "note-content";
    content.textContent = note.content || "";

    const meta = document.createElement("div");
    meta.className = "note-meta";

    const dateSpan = document.createElement("span");
    dateSpan.className = "kv";
    const d = new Date(note.updatedAt || note.createdAt || Date.now());
    dateSpan.textContent = d.toLocaleString();

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn edit";
    editBtn.title = "Edit note";
    editBtn.innerHTML = "✎";
    editBtn.addEventListener("click", () => startEdit(note.id));

    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn delete";
    delBtn.title = "Delete note";
    delBtn.innerHTML = "🗑";
    delBtn.addEventListener("click", () => deleteNote(note.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    meta.appendChild(dateSpan);
    meta.appendChild(actions);

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(meta);

    return card;
  }

  // Render notes (optional filter)
  function render(filter = ""){
    // clear
    notesList.innerHTML = "";
    const q = (filter || "").trim().toLowerCase();

    const filtered = notes.filter(n => {
      if (!q) return true;
      return (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
    });

    if (filtered.length === 0){
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
      // sort by updatedAt descending
      filtered.sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
      filtered.forEach(n => notesList.appendChild(createNoteCard(n)));
    }
  }

  // Add new note
  function addNote(title, content){
    const now = Date.now();
    const note = { id: uid(), title: title.trim(), content: content.trim(), createdAt: now, updatedAt: now };
    notes.push(note);
    saveNotes();
    render(searchInput.value);
  }

  // Start editing existing note
  function startEdit(id){
    const note = notes.find(n => n.id === id);
    if (!note) return;
    editId = id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    saveBtn.textContent = "Update Note";
    cancelBtn.hidden = false;
    titleInput.focus();
  }

  // Update note
  function updateNote(id, title, content){
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.title = title.trim();
    note.content = content.trim();
    note.updatedAt = Date.now();
    saveNotes();
    render(searchInput.value);
  }

  // Delete single note
  function deleteNote(id){
    if (!confirm("Delete this note?")) return;
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    render(searchInput.value);
  }

  // Clear all notes
  function clearAll(){
    if (!notes.length) return;
    if (!confirm("Delete ALL notes? This cannot be undone.")) return;
    notes = [];
    saveNotes();
    render("");
  }

  // Cancel edit
  function cancelEdit(){
    editId = null;
    form.reset();
    saveBtn.textContent = "Save Note";
    cancelBtn.hidden = true;
  }

  // Form submit handler
  function onSubmit(e){
    e.preventDefault();
    const t = titleInput.value.trim();
    const c = contentInput.value.trim();
    if (!t && !c){
      alert("Please add a title or content for the note.");
      return;
    }
    if (editId){
      updateNote(editId, t, c);
      cancelEdit();
    } else {
      addNote(t || "Untitled", c);
      form.reset();
    }
  }

  // Search handler (live)
  function onSearch(){
    render(searchInput.value);
  }

  // Keyboard shortcut: Ctrl+Enter to submit
  function onKeydown(e){
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter"){
      form.requestSubmit();
    }
  }

  // Initialize
  function init(){
    loadNotes();
    render();
    form.addEventListener("submit", onSubmit);
    cancelBtn.addEventListener("click", cancelEdit);
    searchInput.addEventListener("input", onSearch);
    clearAllBtn.addEventListener("click", clearAll);
    document.addEventListener("keydown", onKeydown);
  }

  // start app
  init();
})();