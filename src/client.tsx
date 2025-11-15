// Load the static HTML content directly
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById("app")!;
  
  // Replace the app content with your Forest Friend HTML
  appElement.innerHTML = `
    <div class="min-h-screen p-4 starry-sky">
      <div class="stars" aria-hidden="true"></div>
      <div class="moon" aria-hidden="true"></div>
      <div class="constellation" aria-hidden="true">
        <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" width="280" height="160">
          <g stroke="rgba(255,255,255,0.65)" stroke-width="1" fill="none">
            <line x1="20" y1="120" x2="60" y2="40" />
            <line x1="60" y1="40" x2="120" y2="70" />
            <line x1="120" y1="70" x2="180" y2="30" />
          </g>
          <g fill="white" opacity="0.9">
            <circle cx="20" cy="120" r="2.2" />
            <circle cx="60" cy="40" r="2.6" />
            <circle cx="120" cy="70" r="2.2" />
            <circle cx="180" cy="30" r="2.6" />
          </g>
        </svg>
      </div>
      <div class="streetwalk" aria-hidden="true">
        <!-- Inline SVG for street silhouette, bench and lamp -->
        <svg class="street-svg" viewBox="0 0 1200 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="gSilhouette" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#0a0a0a" />
              <stop offset="100%" stop-color="#050505" />
            </linearGradient>
            <radialGradient id="lampGlow" cx="30%" cy="20%" r="50%">
              <stop offset="0%" stop-color="rgba(255,230,160,0.9)" />
              <stop offset="45%" stop-color="rgba(255,200,100,0.18)" />
              <stop offset="100%" stop-color="rgba(255,200,100,0)" />
            </radialGradient>
          </defs>
          <!-- ground / silhouette -->
          <path class="street-silhouette" d="M0 200 C150 150 300 220 480 200 C600 185 760 210 920 190 C980 182 1100 200 1200 200 L1200 320 L0 320 Z" fill="url(#gSilhouette)" />
          <!-- bench group -->
          <g class="bench" transform="translate(180,170) scale(1)">
            <rect x="0" y="0" width="160" height="18" rx="3" fill="#0b0b0b" />
            <g fill="#141414" opacity="0.95">
              <rect x="6" y="2" width="148" height="3" rx="1" />
              <rect x="6" y="7" width="148" height="3" rx="1" />
              <rect x="6" y="12" width="148" height="3" rx="1" />
            </g>
            <rect x="10" y="18" width="10" height="36" fill="#0b0b0b" />
            <rect x="140" y="18" width="10" height="36" fill="#0b0b0b" />
            <rect x="6" y="-10" width="148" height="8" rx="2" fill="#111111" />
          </g>
          <!-- lamp group -->
          <g class="lamp" transform="translate(820,32)">
            <rect x="22" y="28" width="6" height="200" fill="#0b0b0b" rx="2" />
            <g transform="translate(0,6)">
              <rect x="12" y="0" width="44" height="10" rx="4" fill="#151515" />
              <rect x="18" y="-12" width="28" height="18" rx="6" fill="#121212" />
              <ellipse cx="32" cy="-6" rx="10" ry="6" fill="#ffdca8" opacity="0.95" />
              <circle class="glow" cx="16" cy="-6" r="40" fill="url(#lampGlow)" />
              <ellipse cx="36" cy="-8" rx="3" ry="1.6" fill="rgba(255,255,255,0.12)" />
            </g>
          </g>
        </svg>
      </div>
      <div class="max-w-7xl mx-auto star-content">
        <div class="glass-card rounded-3xl shadow-2xl p-6 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="text-5xl">🦊</div>
              <div>
                <h1 class="text-3xl font-bold text-gray-800">Forest Friend</h1>
                <p class="text-gray-600">Let's do fun things together!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
});
