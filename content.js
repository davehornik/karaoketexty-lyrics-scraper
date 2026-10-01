(() => {
  // Don't inject twice
  if (document.getElementById('kls-btn-group')) return;

  // Only song pages have a lyrics container (artist / album pages don't)
  const lyricsRoot = document.querySelector('.lyrics_cont');
  if (!lyricsRoot) return;

  // Site UI strings that can end up inside the lyrics container (for logged-in
  // users the site renders a "Kopíruj text" button and "Opravit text" link there).
  const UI_TEXT = /^(kopíruj text|opravit text|je zde něco špatně\??|kopírovat|zkopírováno!?)$/i;

  // Turn one lyrics <span> into clean text: <br> -> newline, trimmed lines, no blank lines
  function spanToText(span) {
    if (!span) return '';
    const clone = span.cloneNode(true);
    clone.querySelectorAll('script, style, iframe, img, button, input, select, textarea, form, [role="button"], .copytext_butt, .copytext_cont1')
      .forEach(el => el.remove());
    // Drop any leftover element whose whole text is just a site UI label
    [...clone.querySelectorAll('*')].reverse().forEach(el => {
      if (UI_TEXT.test(el.textContent.replace(/\s+/g, ' ').trim())) el.remove();
    });
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return clone.textContent
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(line => line && !UI_TEXT.test(line))
      .join('\n');
  }

  // Walk only the .para_row blocks. Ads, the photo gallery, the
  // "Chceš vidět méně reklam? Registruj se" box and the "Text přidal" credits
  // sit between/after them and are therefore skipped automatically.
  function extractLyrics() {
    const original = [];
    const translation = [];

    lyricsRoot.querySelectorAll('.para_row').forEach(row => {
      // Pages without translation use .para_1lyrics_col1,
      // pages with translation use .para_col1 (original) + .para_col2 (translation)
      const orig = spanToText(row.querySelector('.para_1lyrics_col1, .para_col1'));
      const trans = spanToText(row.querySelector('.para_col2'));
      if (orig || trans) {
        original.push(orig);
        translation.push(trans);
      }
    });

    if (!original.length) return null;

    const hasTranslation = translation.some(Boolean);

    return {
      original: original.join('\n\n'),
      translation: hasTranslation ? translation.join('\n\n') : null,
      combined: hasTranslation
        ? original
            .map((o, i) => [o, translation[i]].filter(Boolean).join('\n\n'))
            .join('\n\n---\n\n')
        : null
    };
  }

  function extractMetadata() {
    // Breadcrumb above the title: letter / artist / (album)
    const artist = document.querySelectorAll('.navigation_lyrics a')[1]?.textContent?.trim() || '';

    // og:title is "Artist - Title" and, unlike <h1>, is never truncated with ".."
    let title = document.querySelector('meta[property="og:title"]')?.content?.trim() || '';
    if (artist && title.startsWith(artist + ' - ')) {
      title = title.slice(artist.length + 3);
    }
    if (!title) {
      title = document.querySelector('#song_title')?.childNodes[0]?.textContent?.trim() || '';
    }

    return { title, artist };
  }

  function buildFilename(artist, title, suffix) {
    const clean = str => str.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_').substring(0, 80);
    let base;
    if (artist && title) base = `${clean(artist)}-${clean(title)}`;
    else if (title) base = clean(title);
    else base = 'karaoketexty_lyrics';
    return `${base}${suffix}.txt`;
  }

  function saveAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function showToast(message) {
    let toast = document.getElementById('kls-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kls-toast';
      // Put the toast inside the button group so it always sits above the buttons
      document.getElementById('kls-btn-group').prepend(toast);
    }
    toast.textContent = message;
    toast.classList.add('kls-toast-visible');
    setTimeout(() => toast.classList.remove('kls-toast-visible'), 2500);
  }

  function handleSave(kind) {
    const lyrics = extractLyrics();
    if (!lyrics || !lyrics[kind]) {
      showToast('❌ Text na stránce nenalezen');
      return;
    }
    const { title, artist } = extractMetadata();
    const suffix = kind === 'translation' ? '_preklad' : kind === 'combined' ? '_text+preklad' : '';
    const filename = buildFilename(artist, title, suffix);
    saveAsFile(lyrics[kind], filename);
    showToast(`✅ Uloženo: ${filename}`);
  }

  const ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`;

  function makeButton(label, kind) {
    const btn = document.createElement('button');
    btn.className = 'kls-btn';
    btn.innerHTML = `${ICON}<span>${label}</span>`;
    btn.addEventListener('click', () => handleSave(kind));
    return btn;
  }

  const hasTranslation = !!lyricsRoot.querySelector('.para_col2');

  const group = document.createElement('div');
  group.id = 'kls-btn-group';
  group.appendChild(makeButton('Uložit text', 'original'));
  if (hasTranslation) {
    group.appendChild(makeButton('Uložit překlad', 'translation'));
    group.appendChild(makeButton('Uložit text + překlad', 'combined'));
  }
  document.body.appendChild(group);
})();
