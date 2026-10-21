/**
 * GIT DISCO - APPLICATION LOGIC & SYNTHESIZER
 * Zero external libraries. 100% pure vanilla JS, SVG, and Web Audio API.
 */

// ==========================================
// 1. STATE & CONFIGURATION
// ==========================================
const state = {
  cats: [],
  bpm: 124,
  isPlayingAudio: false,
  audioCtx: null,
  schedulerTimer: null,
  current16thNote: 0,
  nextNoteTime: 0.0,
  theme: 'theme-neon',
  searchQuery: '',
};

// ==========================================
// 2. PROCEDURAL SVG CAT GENERATOR & DRESS CODE VALIDATOR
// ==========================================

const VALID_SPECS = {
  breeds: ['calico', 'tuxedo', 'ginger', 'siamese', 'void', 'neon'],
  dances: ['breakdance', 'bounce', 'spin', 'moonwalk', 'disco', 'headbang', 'robot', 'wiggle'],
  accessories: ['sunglasses', 'party-hat', 'headphones', 'gold-chain', 'bow-tie', 'crown', 'none'],
  speeds: ['chill', 'normal', 'hyper']
};

function validateCat(cat, filename = '') {
  const errors = [];
  if (!cat || typeof cat !== 'object') {
    return ['File does not contain a valid JSON object.'];
  }

  // 1. Required fields
  if (!cat.username || typeof cat.username !== 'string' || !cat.username.trim()) {
    errors.push('Missing or empty "username" field.');
  } else if (filename) {
    const base = filename.replace(/\.json$/i, '');
    if (cat.username.toLowerCase() !== base.toLowerCase()) {
      errors.push(`"username": "${cat.username}" does not match filename "${filename}"! It must be "${base}".`);
    }
  }

  if (!cat.name || typeof cat.name !== 'string' || !cat.name.trim()) {
    errors.push('Missing or empty "name" (student name) field.');
  }

  if (!cat.cat_name || typeof cat.cat_name !== 'string' || !cat.cat_name.trim()) {
    errors.push('Missing or empty "cat_name" field.');
  }

  // 2. Breed check
  const breed = (cat.breed || '').toLowerCase();
  if (!breed) {
    errors.push('Missing required "breed" field.');
  } else if (!VALID_SPECS.breeds.includes(breed)) {
    errors.push(`Unknown breed "${cat.breed}". Allowed breeds: ${VALID_SPECS.breeds.join(', ')}.`);
  }

  // 3. Dance style check
  const dance = (cat.dance_style || '').toLowerCase();
  if (!dance) {
    errors.push('Missing required "dance_style" field.');
  } else if (!VALID_SPECS.dances.includes(dance)) {
    errors.push(`Unknown dance_style "${cat.dance_style}". Allowed styles: ${VALID_SPECS.dances.join(', ')}.`);
  }

  // 4. Accessory check
  const accessory = (cat.accessory || 'none').toLowerCase();
  if (!VALID_SPECS.accessories.includes(accessory)) {
    errors.push(`Unknown accessory "${cat.accessory}". Allowed accessories: ${VALID_SPECS.accessories.join(', ')}.`);
  }

  // 5. Groove speed check
  const speed = (cat.groove_speed || 'normal').toLowerCase();
  if (!VALID_SPECS.speeds.includes(speed)) {
    errors.push(`Unknown groove_speed "${cat.groove_speed}". Allowed speeds: ${VALID_SPECS.speeds.join(', ')}.`);
  }

  return errors;
}

function getBreedColors(breed) {
  switch (breed?.toLowerCase()) {
    case 'tuxedo':
      return { body: '#1e1c24', belly: '#f5f5f5', innerEar: '#ffb3c6', eyes: '#2ecc71', nose: '#ff99b3' };
    case 'calico':
      return { body: '#f3ede2', patch1: '#e67e22', patch2: '#2c3e50', innerEar: '#ffb3c6', eyes: '#3498db', nose: '#ff99b3' };
    case 'ginger':
      return { body: '#e67e22', belly: '#f39c12', stripes: '#d35400', innerEar: '#ff9999', eyes: '#27ae60', nose: '#ff8899' };
    case 'siamese':
      return { body: '#f7eee3', points: '#4a3728', innerEar: '#6b4f3b', eyes: '#00d2d3', nose: '#3d2b1f' };
    case 'void':
      return { body: '#0d0d12', belly: '#1a1a24', innerEar: '#2d1b40', eyes: '#ffe600', nose: '#15151f' };
    case 'neon':
    default:
      return { body: '#140c26', glow: '#00f0ff', innerEar: '#ff007f', eyes: '#00ff66', nose: '#ff007f' };
  }
}

function renderCatSVG(cat) {
  const breed = cat.breed || 'tuxedo';
  const c = getBreedColors(breed);
  const favColor = cat.favorite_color || '#ff007f';
  const accessory = cat.accessory || 'none';

  // SVG Elements for accessories
  let accessorySvg = '';
  if (accessory === 'sunglasses') {
    accessorySvg = `
      <!-- Sunglasses -->
      <g class="acc-sunglasses">
        <path d="M 28 35 L 47 35 L 44 45 L 31 45 Z" fill="#111" stroke="${favColor}" stroke-width="1.5" />
        <path d="M 53 35 L 72 35 L 69 45 L 56 45 Z" fill="#111" stroke="${favColor}" stroke-width="1.5" />
        <line x1="47" y1="38" x2="53" y2="38" stroke="${favColor}" stroke-width="2" />
        <!-- Glare shine -->
        <line x1="32" y1="37" x2="40" y2="43" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.8" />
        <line x1="57" y1="37" x2="65" y2="43" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity="0.8" />
      </g>
    `;
  } else if (accessory === 'party-hat') {
    accessorySvg = `
      <!-- Party Hat -->
      <g class="acc-party-hat">
        <polygon points="50,2 38,26 62,26" fill="${favColor}" stroke="#fff" stroke-width="1.5" />
        <circle cx="50" cy="2" r="3.5" fill="#ffe600" />
        <circle cx="44" cy="18" r="2" fill="#fff" opacity="0.7" />
        <circle cx="54" cy="14" r="2" fill="#fff" opacity="0.7" />
      </g>
    `;
  } else if (accessory === 'headphones') {
    accessorySvg = `
      <!-- DJ Headphones -->
      <g class="acc-headphones">
        <path d="M 22 42 A 28 28 0 0 1 78 42" fill="none" stroke="${favColor}" stroke-width="4" stroke-linecap="round" />
        <rect x="18" y="34" width="8" height="18" rx="4" fill="#222" stroke="${favColor}" stroke-width="1.5" />
        <rect x="74" y="34" width="8" height="18" rx="4" fill="#222" stroke="${favColor}" stroke-width="1.5" />
      </g>
    `;
  } else if (accessory === 'gold-chain') {
    accessorySvg = `
      <!-- Gold Bling Chain -->
      <g class="acc-gold-chain">
        <path d="M 38 68 Q 50 82 62 68" fill="none" stroke="#ffd700" stroke-width="3" stroke-linecap="round" stroke-dasharray="3,1" />
        <!-- Git commit tag medallion -->
        <circle cx="50" cy="80" r="7" fill="#ffd700" stroke="#b8860b" stroke-width="1.5" />
        <circle cx="50" cy="80" r="2.5" fill="#111" />
      </g>
    `;
  } else if (accessory === 'bow-tie') {
    accessorySvg = `
      <!-- Bow Tie -->
      <g class="acc-bowtie">
        <polygon points="40,64 50,68 40,72" fill="${favColor}" />
        <polygon points="60,64 50,68 60,72" fill="${favColor}" />
        <circle cx="50" cy="68" r="2.5" fill="#fff" />
      </g>
    `;
  } else if (accessory === 'crown') {
    accessorySvg = `
      <!-- Crown -->
      <g class="acc-crown">
        <polygon points="34,26 38,12 44,22 50,8 56,22 62,12 66,26" fill="#ffd700" stroke="#b8860b" stroke-width="1.5" />
        <circle cx="38" cy="12" r="1.5" fill="${favColor}" />
        <circle cx="50" cy="8" r="1.5" fill="${favColor}" />
        <circle cx="62" cy="12" r="1.5" fill="${favColor}" />
      </g>
    `;
  }

  // Breed special patterns
  let breedSpecificPatterns = '';
  if (breed === 'calico') {
    breedSpecificPatterns = `
      <circle cx="38" cy="34" r="10" fill="${c.patch1}" />
      <circle cx="64" cy="40" r="8" fill="${c.patch2}" />
      <path d="M 40 68 Q 50 78 60 70 Q 55 90 40 88 Z" fill="${c.patch1}" />
    `;
  } else if (breed === 'ginger') {
    breedSpecificPatterns = `
      <!-- Tabby stripes -->
      <path d="M 45 28 L 50 35 L 55 28" fill="none" stroke="${c.stripes}" stroke-width="2" stroke-linecap="round" />
      <path d="M 47 24 L 50 28 L 53 24" fill="none" stroke="${c.stripes}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M 32 70 L 42 74" fill="none" stroke="${c.stripes}" stroke-width="2" stroke-linecap="round" />
      <path d="M 68 70 L 58 74" fill="none" stroke="${c.stripes}" stroke-width="2" stroke-linecap="round" />
    `;
  } else if (breed === 'siamese') {
    breedSpecificPatterns = `
      <!-- Dark snout mask & ear tips -->
      <ellipse cx="50" cy="46" rx="14" ry="10" fill="${c.points}" />
    `;
  } else if (breed === 'tuxedo') {
    breedSpecificPatterns = `
      <!-- White chest bib & white muzzle -->
      <polygon points="46,54 54,54 62,88 38,88" fill="${c.belly}" />
      <ellipse cx="50" cy="47" rx="8" ry="6" fill="${c.belly}" />
    `;
  } else if (breed === 'neon') {
    breedSpecificPatterns = `
      <circle cx="50" cy="50" r="42" fill="none" stroke="${favColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6" />
    `;
  }

  return `
    <svg class="cat-svg" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="discoJacket-${cat.username}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${favColor}" />
          <stop offset="100%" stop-color="#111" />
        </radialGradient>
      </defs>

      <!-- Tail -->
      <path d="M 66 84 C 84 84, 88 58, 80 50 C 76 46, 72 49, 74 54 C 77 60, 75 75, 62 76" 
            fill="none" stroke="${c.points || c.body}" stroke-width="6" stroke-linecap="round" />

      <!-- Back Feet -->
      <ellipse cx="34" cy="94" rx="8" ry="5" fill="${c.points || c.body}" />
      <ellipse cx="66" cy="94" rx="8" ry="5" fill="${c.points || c.body}" />

      <!-- Cat Body / Jacket -->
      <path d="M 35 60 C 28 70, 26 88, 36 94 C 44 95, 56 95, 64 94 C 74 88, 72 70, 65 60 Z" 
            fill="${c.body}" />

      <!-- Breed Specific Overlays on Body -->
      ${breedSpecificPatterns}

      <!-- Front Paws -->
      <ellipse cx="43" cy="92" rx="5" ry="6" fill="${c.belly || c.body}" />
      <ellipse cx="57" cy="92" rx="5" ry="6" fill="${c.belly || c.body}" />

      <!-- Left Ear -->
      <polygon points="26,38 34,14 46,30" fill="${c.points || c.body}" />
      <polygon points="30,34 35,19 43,29" fill="${c.innerEar}" />

      <!-- Right Ear -->
      <polygon points="74,38 66,14 54,30" fill="${c.points || c.body}" />
      <polygon points="70,34 65,19 57,29" fill="${c.innerEar}" />

      <!-- Head -->
      <ellipse cx="50" cy="42" rx="24" ry="20" fill="${c.body}" />

      <!-- Whiskers -->
      <line x1="22" y1="44" x2="36" y2="46" stroke="#fff" stroke-width="1.2" opacity="0.6" />
      <line x1="20" y1="49" x2="36" y2="49" stroke="#fff" stroke-width="1.2" opacity="0.6" />
      <line x1="78" y1="44" x2="64" y2="46" stroke="#fff" stroke-width="1.2" opacity="0.6" />
      <line x1="80" y1="49" x2="64" y2="49" stroke="#fff" stroke-width="1.2" opacity="0.6" />

      <!-- Eyes (or Red X if broken/invalid) -->
      ${cat.errors && cat.errors.length > 0 ? `
        <text x="35" y="44" fill="#ff0055" font-size="14" font-weight="900" font-family="monospace">✕</text>
        <text x="56" y="44" fill="#ff0055" font-size="14" font-weight="900" font-family="monospace">✕</text>
        <rect x="32" y="74" width="36" height="13" rx="3" fill="#ff0055" />
        <text x="50" y="84" text-anchor="middle" fill="#fff" font-size="8" font-weight="900" font-family="monospace">INVALID</text>
      ` : accessory !== 'sunglasses' ? `
        <ellipse cx="40" cy="40" rx="4.5" ry="5.5" fill="${c.eyes}" />
        <ellipse cx="60" cy="40" rx="4.5" ry="5.5" fill="${c.eyes}" />
        <ellipse cx="40" cy="40" rx="2" ry="4.5" fill="#111" />
        <ellipse cx="60" cy="40" rx="2" ry="4.5" fill="#111" />
        <!-- Eye twinkle -->
        <circle cx="38.5" cy="38" r="1.5" fill="#fff" />
        <circle cx="58.5" cy="38" r="1.5" fill="#fff" />
      ` : ''}

      <!-- Cute Nose & Mouth -->
      <polygon points="50,47 47,44 53,44" fill="${c.nose}" />
      <path d="M 47 48 Q 50 51 50 49 Q 50 51 53 48" fill="none" stroke="#222" stroke-width="1.2" stroke-linecap="round" />

      <!-- Accessory Element (or Warning if invalid accessory) -->
      ${cat.errors && cat.errors.some(e => e.includes('accessory')) ? `
        <text x="44" y="24" fill="#ff0055" font-size="16">⚠️</text>
      ` : accessorySvg}
    </svg>
  `;
}

// ==========================================
// 3. WEB AUDIO API SYNTHESIZER
// Zero audio files. Pure real-time synthesis.
// ==========================================

function initAudio() {
  if (!state.audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContext();
  }
  if (state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }
}

// Kick drum synthesis
function playKick(time) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.connect(gain);
  gain.connect(state.audioCtx.destination);

  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);

  gain.gain.setValueAtTime(1.0, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc.start(time);
  osc.stop(time + 0.4);
}

// Snare / Clap synthesis with noise buffer
function playSnare(time) {
  const bufferSize = state.audioCtx.sampleRate * 0.2;
  const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = state.audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = state.audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(900, time);

  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(state.audioCtx.destination);

  noise.start(time);
  noise.stop(time + 0.2);
}

// Hi-Hat synthesis
function playHiHat(time, open = false) {
  const bufferSize = state.audioCtx.sampleRate * (open ? 0.25 : 0.06);
  const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = state.audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = state.audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(9500, time);

  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.25 : 0.05));

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(state.audioCtx.destination);

  noise.start(time);
  noise.stop(time + (open ? 0.25 : 0.06));
}

// Funky synth bass note
function playSynthBass(noteFreq, time, duration = 0.18) {
  const osc = state.audioCtx.createOscillator();
  const filter = state.audioCtx.createBiquadFilter();
  const gain = state.audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(noteFreq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, time);
  filter.frequency.exponentialRampToValueAtTime(120, time + duration);

  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(state.audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

// Disco Bassline Notes (MIDI to Hz approx)
const BASS_LINE = [
  110.0, 0, 110.0, 0,   130.81, 0, 146.83, 0,  // A2, C3, D3
  164.81, 0, 146.83, 0, 130.81, 0, 123.47, 0   // E3, D3, C3, B2
];

function scheduleStep(stepNumber, time) {
  // 1. Kick on every quarter note (0, 4, 8, 12)
  if (stepNumber % 4 === 0) {
    playKick(time);
  }

  // 2. Snare / Clap on beats 2 & 4 (steps 4 & 12)
  if (stepNumber === 4 || stepNumber === 12) {
    playSnare(time);
  }

  // 3. Disco off-beat hi-hat on every odd 8th note (2, 6, 10, 14)
  if (stepNumber % 4 === 2) {
    playHiHat(time, true);
  } else {
    playHiHat(time, false);
  }

  // 4. Synth bassline
  const bassFreq = BASS_LINE[stepNumber % BASS_LINE.length];
  if (bassFreq > 0) {
    playSynthBass(bassFreq, time, 0.14);
  }

  // Trigger visual tile flash in sync with audio step
  const delayMs = Math.max(0, (time - state.audioCtx.currentTime) * 1000);
  setTimeout(() => {
    flashFloorTiles(stepNumber);
  }, delayMs);
}

function audioScheduler() {
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // seconds

  while (state.nextNoteTime < state.audioCtx.currentTime + scheduleAheadTime) {
    scheduleStep(state.current16thNote, state.nextNoteTime);
    const secondsPerBeat = 60.0 / state.bpm;
    state.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
    state.current16thNote = (state.current16thNote + 1) % 16;
  }

  if (state.isPlayingAudio) {
    state.schedulerTimer = setTimeout(audioScheduler, lookahead);
  }
}

function toggleAudio() {
  initAudio();
  const musicBtn = document.getElementById('musicToggleBtn');
  const body = document.body;

  if (state.isPlayingAudio) {
    state.isPlayingAudio = false;
    clearTimeout(state.schedulerTimer);
    musicBtn.classList.remove('playing');
    musicBtn.querySelector('.btn-label').textContent = 'PLAY BEAT';
    body.classList.remove('beat-active');
  } else {
    state.isPlayingAudio = true;
    state.current16thNote = 0;
    state.nextNoteTime = state.audioCtx.currentTime + 0.05;
    audioScheduler();
    musicBtn.classList.add('playing');
    musicBtn.querySelector('.btn-label').textContent = 'STOP BEAT';
    body.classList.add('beat-active');
  }
}

// 8-bit Synthesized Meow when clicking on a cat
function playCatMeow() {
  if (!state.audioCtx) initAudio();
  if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

  const now = state.audioCtx.currentTime;
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();

  osc.type = 'triangle';
  // Slide pitch like a meow: high -> higher -> drops down
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.38);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  osc.connect(gain);
  gain.connect(state.audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.38);
}

// ==========================================
// 4. DANCE FLOOR TILES GENERATOR & LIGHTS
// ==========================================

function initDanceFloorTiles() {
  const container = document.getElementById('danceFloorTiles');
  container.innerHTML = '';
  const totalTiles = 60; // 10 x 6
  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = i;
    container.appendChild(tile);
  }
}

const TILE_COLORS = ['lit-pink', 'lit-cyan', 'lit-yellow', 'lit-purple', 'lit-green'];

function flashFloorTiles(step) {
  const tiles = document.querySelectorAll('.dancefloor-grid .tile');
  if (!tiles.length) return;

  // Clear previous flashes
  tiles.forEach(t => {
    t.className = 'tile';
  });

  // Highlight a rhythmic pattern
  const color = TILE_COLORS[step % TILE_COLORS.length];
  const offset = step % 5;
  tiles.forEach((t, i) => {
    if ((i + offset) % 4 === 0) {
      t.classList.add(color);
    }
  });
}

// ==========================================
// 5. RENDER CATS ON STAGE & FLOOR
// ==========================================

function renderDancers() {
  const djPlatform = document.getElementById('djPlatform');
  const danceFloor = document.getElementById('danceFloorActors');
  const catCountText = document.getElementById('catCountText');

  djPlatform.innerHTML = '';
  danceFloor.innerHTML = '';

  const query = state.searchQuery.toLowerCase().trim();

  // Find instructor DJ cat or default first
  let djCat = state.cats.find(c => c.username?.toLowerCase() === 'instructor') || state.cats[0];
  const studentCats = state.cats.filter(c => c !== djCat);

  // Update Cat Counter Badge
  const count = state.cats.length;
  catCountText.textContent = `${count} ${count === 1 ? 'Cat' : 'Cats'} Grooving`;

  // Render DJ Cat on stage
  if (djCat) {
    const djElem = createCatElement(djCat, true);
    djPlatform.appendChild(djElem);
  }

  // Render Student Cats on the dance floor
  studentCats.forEach(cat => {
    const isMatch = !query ||
      cat.name?.toLowerCase().includes(query) ||
      cat.cat_name?.toLowerCase().includes(query) ||
      cat.username?.toLowerCase().includes(query) ||
      cat.dance_style?.toLowerCase().includes(query);

    const catElem = createCatElement(cat, false);
    if (!isMatch) {
      catElem.classList.add('dimmed');
    } else if (query) {
      catElem.classList.add('spotlight');
    }
    danceFloor.appendChild(catElem);
  });
}

function createCatElement(cat, isDj = false) {
  const wrap = document.createElement('div');
  const hasErrors = cat.errors && cat.errors.length > 0;
  const styleClass = hasErrors ? 'dance-broken' : `dance-${(cat.dance_style || 'bounce').toLowerCase()}`;
  const speedClass = `speed-${(cat.groove_speed || 'normal').toLowerCase()}`;

  wrap.className = `cat-dancer ${styleClass} ${speedClass} ${isDj ? 'dj-performer' : ''} ${hasErrors ? 'broken-cat' : ''}`;
  wrap.dataset.username = cat.username;

  wrap.innerHTML = `
    <div class="cat-speech-bubble">${hasErrors ? `🚨 "Oops! I have ${cat.errors.length} error(s)! Click to fix!"` : `"${cat.catchphrase || 'Git dance!'}"`}</div>
    <div class="cat-avatar-wrap">
      ${renderCatSVG(cat)}
    </div>
    <div class="cat-shadow"></div>
    <div class="cat-label">
      <span class="cat-label-name">${cat.cat_name || 'Anonymous Cat'}${hasErrors ? ` <span class="broken-badge">⚠️ ${cat.errors.length} ISSUE${cat.errors.length > 1 ? 'S' : ''}</span>` : ''}</span>
      <span class="cat-label-sub">@${cat.username || 'unknown'}${hasErrors ? ' • Validation Error' : ''}</span>
    </div>
  `;

  // Click handler for cat solo move + sound + inspect modal
  wrap.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hasErrors) {
      showCatErrorModal(cat);
    } else {
      playCatMeow();
      wrap.classList.add('speaking');
      setTimeout(() => wrap.classList.remove('speaking'), 2400);
      showCatDetailModal(cat);
    }
  });

  return wrap;
}

function showCatErrorModal(cat) {
  const modal = document.getElementById('catErrorModal');
  const body = document.getElementById('modalErrorBody');
  if (!modal || !body) return;

  const errors = cat.errors || ['Unknown validation error.'];
  body.innerHTML = `
    <div class="error-diagnosis-box">
      <div class="error-intro">
        🚨 <strong>cats/${cat.username || 'cat'}.json</strong> has ${errors.length} validation issue${errors.length > 1 ? 's' : ''}:
      </div>
      <ul>
        ${errors.map(err => `<li>❌ ${err}</li>`).join('')}
      </ul>
      <p style="margin-top: 14px; color: #fff; font-size: 13px;">
        💡 <em>Fix these lines in your local JSON file and preview/drop it again to make your cat dance!</em>
      </p>
    </div>
  `;
  modal.style.display = 'flex';
}

function showCatDetailModal(cat) {
  const modal = document.getElementById('catDetailModal');
  const title = document.getElementById('modalCatTitle');
  const body = document.getElementById('modalCatBody');

  title.textContent = `${cat.cat_name || 'Dancing Cat'} (@${cat.username})`;
  body.innerHTML = `
    <div class="detail-cat-preview">
      ${renderCatSVG(cat)}
    </div>
    <div class="cat-catchphrase-quote">
      "${cat.catchphrase || 'Git commit, git dance!'}"
    </div>
    <div class="cat-props-grid">
      <div>
        <div class="prop-label">Student / Creator</div>
        <div class="prop-val">${cat.name || 'Anonymous'}</div>
      </div>
      <div>
        <div class="prop-label">GitHub Handle</div>
        <div class="prop-val">@${cat.username}</div>
      </div>
      <div>
        <div class="prop-label">Breed</div>
        <div class="prop-val">${cat.breed || 'Standard'}</div>
      </div>
      <div>
        <div class="prop-label">Dance Style</div>
        <div class="prop-val">${cat.dance_style || 'Bounce'}</div>
      </div>
      <div>
        <div class="prop-label">Accessory</div>
        <div class="prop-val">${cat.accessory || 'None'}</div>
      </div>
      <div>
        <div class="prop-label">Groove Speed</div>
        <div class="prop-val">${cat.groove_speed || 'Normal'}</div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// ==========================================
// 6. DATA LOADING & PREVIEW STRATEGY (100% HTML/JS)
// ==========================================

function showCatToast(msg) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function loadCatFromFile(file) {
  if (!file.name.endsWith('.json')) {
    showCatToast('⚠️ Please drop a .json cat file!');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const cat = JSON.parse(e.target.result);
      if (!cat.username) {
        cat.username = file.name.replace(/\.json$/i, '');
      }

      // 🔍 Strict Dress Code / Schema Validation
      const errors = validateCat(cat, file.name);
      if (errors.length > 0) {
        cat.errors = errors;
        showCatErrorModal(cat);
        showCatToast(`🚫 "${file.name}" has ${errors.length} issue(s)! Check diagnosis!`);
      } else {
        delete cat.errors;
        playCatMeow();
        showCatToast(`🎉 Cat "@${cat.username}" passed all checks and is grooving!`);
      }

      // Add or replace existing in state.cats
      const existingIdx = state.cats.findIndex(c => c.username?.toLowerCase() === cat.username?.toLowerCase());
      if (existingIdx >= 0) {
        state.cats[existingIdx] = cat;
      } else {
        state.cats.push(cat);
      }
      renderDancers();
    } catch (err) {
      showCatToast(`❌ Invalid JSON syntax in ${file.name}`);
      showCatErrorModal({
        username: file.name.replace(/\.json$/i, ''),
        errors: [`Syntax error in JSON: ${err.message}. Please check for trailing commas, unquoted keys, or missing brackets.`]
      });
    }
  };
  reader.readAsText(file);
}

async function loadCats() {
  let loadedCats = [];

  // Strategy 1: Loaded from cats/registry.js (Works on file:/// with zero python/server!)
  if (window.GIT_DISCO_CATS && Array.isArray(window.GIT_DISCO_CATS) && window.GIT_DISCO_CATS.length > 0) {
    loadedCats = window.GIT_DISCO_CATS.map(c => ({ ...c }));
    console.log(`[Git Disco] Loaded ${loadedCats.length} cats from window.GIT_DISCO_CATS`);
  }

  // Strategy 2: If running on a local web server, also attempt cats/registry.json
  if (!loadedCats.length) {
    try {
      const res = await fetch('cats/registry.json', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          loadedCats = data;
          console.log(`[Git Disco] Loaded ${loadedCats.length} cats from cats/registry.json`);
        }
      }
    } catch (e) {
      // Ignored on file://
    }
  }

  // Strategy 3: Built-in fallback
  if (!loadedCats.length) {
    loadedCats = [
      {
        username: "instructor",
        name: "The Tech Lead",
        cat_name: "DJ Git-Master",
        breed: "neon",
        favorite_color: "#00F0FF",
        dance_style: "headbang",
        accessory: "headphones",
        groove_speed: "normal",
        catchphrase: "Merge conflict? Not on my dance floor!"
      }
    ];
  }

  state.cats = loadedCats;
  renderDancers();
}

// ==========================================
// 7. EVENT LISTENERS & INIT
// ==========================================

function setupEventListeners() {
  // Audio Play/Stop Button
  document.getElementById('musicToggleBtn').addEventListener('click', toggleAudio);

  // BPM Slider
  const bpmSlider = document.getElementById('bpmSlider');
  const bpmDisplay = document.getElementById('bpmDisplay');
  bpmSlider.addEventListener('input', (e) => {
    state.bpm = parseInt(e.target.value, 10);
    bpmDisplay.textContent = state.bpm;
    const duration = (60.0 / state.bpm).toFixed(3);
    document.documentElement.style.setProperty('--bpm-duration', `${duration}s`);
  });

  // Lighting Theme Selector
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.addEventListener('change', (e) => {
    document.body.className = `${e.target.value} ${state.isPlayingAudio ? 'beat-active' : ''}`;
  });

  // Cat Search / Filter
  const searchInput = document.getElementById('catSearchInput');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDancers();
  });

  // Preview My Cat Button & File Input
  const previewBtn = document.getElementById('previewCatBtn');
  const fileInput = document.getElementById('catFileInput');
  if (previewBtn && fileInput) {
    previewBtn.addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          loadCatFromFile(files[i]);
        }
      }
      fileInput.value = ''; // reset so same file can be reloaded
    });
  }

  // Drag and Drop JSON onto page to preview
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('drag-over');
  });
  window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null) {
      document.body.classList.remove('drag-over');
    }
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    document.body.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        loadCatFromFile(e.dataTransfer.files[i]);
      }
    }
  });

  // Refresh Button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadCats();
    showCatToast('🔄 Dance floor reloaded!');
  });

  // How to Join Modal
  const helpModal = document.getElementById('helpModal');
  document.getElementById('helpModalBtn').addEventListener('click', () => {
    helpModal.style.display = 'flex';
  });
  document.getElementById('closeHelpModal').addEventListener('click', () => {
    helpModal.style.display = 'none';
  });
  document.getElementById('closeHelpModalBtn').addEventListener('click', () => {
    helpModal.style.display = 'none';
  });

  // Cat Details Modal
  const detailModal = document.getElementById('catDetailModal');
  document.getElementById('closeDetailModal').addEventListener('click', () => {
    detailModal.style.display = 'none';
  });

  // Cat Error Modal
  const errorModal = document.getElementById('catErrorModal');
  document.getElementById('closeErrorModal')?.addEventListener('click', () => {
    errorModal.style.display = 'none';
  });
  document.getElementById('closeErrorModalBtn')?.addEventListener('click', () => {
    errorModal.style.display = 'none';
  });

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.style.display = 'none';
    if (e.target === detailModal) detailModal.style.display = 'none';
    if (e.target === errorModal) errorModal.style.display = 'none';
  });

  // Keyboard shortcut: Spacebar toggles audio beat
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      toggleAudio();
    }
  });
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initDanceFloorTiles();
  setupEventListeners();
  loadCats();
});
