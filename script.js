// ============================================================
// STATE
// ============================================================
let currentChapterIndex = 0;
let currentLanguage = 'en';
let totalChapters = 0;

// ============================================================
// DOM REFS
// ============================================================
const homePage = document.getElementById('homePage');
const readingPage = document.getElementById('readingPage');
const charactersPage = document.getElementById('charactersPage');
const aboutPage = document.getElementById('aboutPage');

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        totalChapters = getTotalChapters();
        loadThemePreference();
        loadProgress();

        const noteBox = document.getElementById('userNote');
        if (noteBox) {
            let timeout;
            noteBox.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(saveUserNote, 1500);
            });
        }

        updateProgressHint();
    } catch(e) {
        console.log('Init error:', e);
    }
});

// ============================================================
// NAVIGATION
// ============================================================
function goHome() {
    readingPage.classList.remove('active');
    charactersPage.classList.remove('active');
    aboutPage.classList.remove('active');
    homePage.classList.add('active');
    updateProgressHint();
}

function startReading() {
    homePage.classList.remove('active');
    charactersPage.classList.remove('active');
    aboutPage.classList.remove('active');
    readingPage.classList.add('active');
    loadProgress();
    renderChapter();
}

function showCharacters() {
    homePage.classList.remove('active');
    readingPage.classList.remove('active');
    aboutPage.classList.remove('active');
    charactersPage.classList.add('active');
}

function showAbout() {
    homePage.classList.remove('active');
    readingPage.classList.remove('active');
    charactersPage.classList.remove('active');
    aboutPage.classList.add('active');
}

// ============================================================
// THEME
// ============================================================
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ramayan-theme', next);
    updateThemeIcons(next);
}

function loadThemePreference() {
    const saved = localStorage.getItem('ramayan-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcons(saved);
}

function updateThemeIcons(theme) {
    const label = theme === 'dark' ? 'Light' : 'Dark';
    const icon = document.getElementById('themeIcon');
    const iconSmall = document.getElementById('themeIconSmall');
    if (icon) icon.textContent = label;
    if (iconSmall) iconSmall.textContent = label;
}

// ============================================================
// LANGUAGE
// ============================================================
function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active-lang'));
    const btn = document.getElementById('lang-' + lang);
    if (btn) btn.classList.add('active-lang');

    document.body.classList.remove('lang-sa');
    if (lang === 'sa') {
        document.body.classList.add('lang-sa');
    }

    localStorage.setItem('ramayan-language', lang);
    renderChapter();
}

function loadLanguagePreference() {
    const saved = localStorage.getItem('ramayan-language') || 'en';
    setLanguage(saved);
}

// ============================================================
// CHAPTER RENDERING
// ============================================================
function renderChapter() {
    try {
        const chapter = getChapter(currentChapterIndex);
        if (!chapter) return;

        document.getElementById('chapterTitle').textContent = chapter.title;
        document.getElementById('chapterImage').src = chapter.image;
        document.getElementById('settingText').textContent = chapter.setting;

        let text = chapter.en;
        if (currentLanguage === 'hi') text = chapter.hi;
        if (currentLanguage === 'sa') text = chapter.sa;
        document.getElementById('storyContent').textContent = text;

        document.getElementById('questionText').textContent = chapter.question;
        document.getElementById('answerText').textContent = chapter.answer;
        document.getElementById('takeawayText').textContent = chapter.takeaway;

        document.getElementById('chapterNumDisplay').textContent = chapter.id;
        document.getElementById('chapterCounter').textContent = (currentChapterIndex + 1) + ' / ' + totalChapters;
        document.getElementById('chapterCounterTop').textContent = (currentChapterIndex + 1) + ' / ' + totalChapters;

        const prevBtn = document.querySelector('.nav-btn:first-child');
        const nextBtn = document.querySelector('.nav-btn:last-child');
        const prevBtnTop = document.querySelector('.nav-btn-top:first-child');
        const nextBtnTop = document.querySelector('.nav-btn-top:last-child');
        if (prevBtn) prevBtn.disabled = currentChapterIndex === 0;
        if (nextBtn) nextBtn.disabled = currentChapterIndex >= totalChapters - 1;
        if (prevBtnTop) prevBtnTop.disabled = currentChapterIndex === 0;
        if (nextBtnTop) nextBtnTop.disabled = currentChapterIndex >= totalChapters - 1;

        const savedNote = localStorage.getItem('ramayan-note-' + chapter.id);
        const noteBox = document.getElementById('userNote');
        if (noteBox && savedNote !== null) {
            noteBox.value = savedNote;
        }

        saveProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
        console.log('Render chapter error:', e);
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function nextChapter() {
    if (currentChapterIndex < totalChapters - 1) {
        currentChapterIndex++;
        renderChapter();
    }
}

function prevChapter() {
    if (currentChapterIndex > 0) {
        currentChapterIndex--;
        renderChapter();
    }
}

// ============================================================
// PROGRESS (Local Storage)
// ============================================================
function saveProgress() {
    localStorage.setItem('ramayan-chapter-index', currentChapterIndex.toString());
    updateProgressHint();
}

function loadProgress() {
    const saved = localStorage.getItem('ramayan-chapter-index');
    if (saved !== null) {
        const idx = parseInt(saved);
        if (idx >= 0 && idx < totalChapters) {
            currentChapterIndex = idx;
        }
    }
    loadLanguagePreference();
}

function updateProgressHint() {
    const hint = document.getElementById('progressHint');
    if (hint) {
        const saved = localStorage.getItem('ramayan-chapter-index');
        if (saved !== null && parseInt(saved) > 0) {
            const chapter = getChapter(parseInt(saved));
            if (chapter) {
                hint.textContent = 'Continue reading: Chapter ' + chapter.id + ' - ' + chapter.title;
                hint.style.opacity = '1';
            }
        } else {
            hint.textContent = 'Your progress is saved on this device.';
            hint.style.opacity = '0.7';
        }
    }
}

// ============================================================
// USER NOTE
// ============================================================
function saveUserNote() {
    const chapter = getChapter(currentChapterIndex);
    if (!chapter) return;
    const noteBox = document.getElementById('userNote');
    if (noteBox) {
        localStorage.setItem('ramayan-note-' + chapter.id, noteBox.value);
    }
}

// ============================================================
// KEYBOARD SUPPORT
// ============================================================
document.addEventListener('keydown', function(e) {
    if (!readingPage.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextChapter();
    }
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevChapter();
    }
});

// ============================================================
// EXPOSE GLOBALLY (for HTML onclick)
// ============================================================
window.goHome = goHome;
window.startReading = startReading;
window.showCharacters = showCharacters;
window.showAbout = showAbout;
window.setLanguage = setLanguage;
window.toggleTheme = toggleTheme;
window.nextChapter = nextChapter;
window.prevChapter = prevChapter;
window.saveUserNote = saveUserNote;
