import { PresetSample } from './types';

// Let's design gorgeous vector SVGs to represent realistic clinical retinal and outer eye scans.
// This allows users to experience the AI scanning technology instantaneously.

// Preset 1: Healthy Retina (Ophthalmic Fundus)
const svgHealthyRetina = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FC8D6B" />
      <stop offset="70%" stop-color="#E25D34" />
      <stop offset="100%" stop-color="#802008" />
    </radialGradient>
    <radialGradient id="opticDiscGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF0BE" />
      <stop offset="75%" stop-color="#FFC56C" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="maculaGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9C2F13" />
      <stop offset="60%" stop-color="#B23C1E" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Fundus Sphere -->
  <circle cx="200" cy="200" r="190" fill="url(#fundusGrad)" stroke="#222" stroke-width="4" />
  
  <!-- Outer Aperture Ring -->
  <circle cx="200" cy="200" r="188" fill="none" stroke="#111" stroke-width="6" opacity="0.8" />

  <!-- Optic Disc (Nasal side) -->
  <circle cx="270" cy="200" r="28" fill="url(#opticDiscGrad)" filter="url(#glow)" />
  <circle cx="270" cy="200" r="10" fill="#FFFBE6" opacity="0.6" filter="url(#glow)" />

  <!-- Macula & Fovea (Temporal side) -->
  <circle cx="150" cy="204" r="22" fill="url(#maculaGrad)" />
  <circle cx="150" cy="204" r="3" fill="#3D1105" opacity="0.9" />

  <!-- Symmetrical Healthy Vascular Arcades leaving Optic Nerve Head -->
  <!-- Superior Arcade (Venous) -->
  <path d="M 270 200 Q 250 120 180 110 T 80 120" stroke="#7E0E00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
  <!-- Superior Arcade (Arterial) -->
  <path d="M 270 200 Q 245 130 190 125 T 90 135" stroke="#BF2A18" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Inferior Arcade (Venous) -->
  <path d="M 270 200 Q 254 280 184 290 T 78 280" stroke="#7E0E00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
  <!-- Inferior Arcade (Arterial) -->
  <path d="M 270 200 Q 248 270 192 275 T 88 265" stroke="#BF2A18" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Nasal Vessels (Horizontal branching off disc to right) -->
  <path d="M 270 200 C 290 190, 320 180, 350 185" stroke="#BF2A18" stroke-width="1.5" fill="none" />
  <path d="M 270 200 C 290 210, 320 220, 354 212" stroke="#7E0E00" stroke-width="2.5" fill="none" opacity="0.8" />

  <!-- Macular/Foveal capillaries (very fine and uniform) -->
  <path d="M 150 204 L 140 198" stroke="#BF2A18" stroke-width="0.5" fill="none" opacity="0.5" />
  <path d="M 150 204 L 160 210" stroke="#BF2A18" stroke-width="0.5" fill="none" opacity="0.5" />
  <path d="M 150 204 L 144 212" stroke="#BF2A18" stroke-width="0.5" fill="none" opacity="0.5" />
  <path d="M 150 204 L 156 195" stroke="#BF2A18" stroke-width="0.5" fill="none" opacity="0.5" />

  <!-- Grid overlay indicating pristine nerve structures -->
  <circle cx="270" cy="200" r="120" stroke="#00FFCC" stroke-dasharray="2 12" stroke-width="0.7" fill="none" opacity="0.3" />
</svg>
`;

// Preset 2: Diabetic Retinopathy Fundus
const svgDiabeticRetina = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FC8D6B" />
      <stop offset="70%" stop-color="#E25D34" />
      <stop offset="100%" stop-color="#802008" />
    </radialGradient>
    <radialGradient id="opticDiscGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF0BE" />
      <stop offset="75%" stop-color="#FFC56C" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="maculaGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9C2F13" />
      <stop offset="60%" stop-color="#B23C1E" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Fundus -->
  <circle cx="200" cy="200" r="190" fill="url(#fundusGrad)" stroke="#222" stroke-width="4" />

  <!-- Optic Disc -->
  <circle cx="270" cy="200" r="28" fill="url(#opticDiscGrad)" filter="url(#glow)" />

  <!-- Macula -->
  <circle cx="150" cy="204" r="22" fill="url(#maculaGrad)" />
  <circle cx="150" cy="204" r="3" fill="#3D1105" opacity="0.9" />

  <!-- Abnormal, Tortuous Vessels (Diabetic Retinal signs) -->
  <!-- Superior Arcade (Venous - beaded, uneven thickness) -->
  <path d="M 270 200 Q 248 110 182 100 T 82 124" stroke="#5C0000" stroke-width="4.2" fill="none" stroke-dasharray="14 1" stroke-linecap="round" opacity="0.9" />
  <!-- Superior Arcade (Arterial - narrowed) -->
  <path d="M 270 200 Q 243 125 188 122 T 92 138" stroke="#D13A28" stroke-width="1.2" fill="none" />

  <!-- Inferior Arcade (Venous - highly tortuous) -->
  <path d="M 270 200 Q 260 290 190 295 T 70 270" stroke="#5C0000" stroke-width="3.8" fill="none" opacity="0.9" />
  <!-- Inferior Arcade (Arterial) -->
  <path d="M 270 200 Q 248 268 196 270 T 80 255" stroke="#D13A28" stroke-width="1.4" fill="none" />

  <!-- Pathological Neovascularization (Clusters of chaotic fine capillaries near disc) -->
  <path d="M 275 180 Q 290 170 295 190 T 305 175" stroke="#7E0E00" stroke-width="0.8" fill="none" opacity="0.8" />
  <path d="M 272 215 Q 295 220 285 230 T 310 225" stroke="#7E0E00" stroke-width="0.8" fill="none" opacity="0.8" />

  <!-- CLINICAL MARKERS: Hard Exudates (Waxy yellow deposits - typical of Diabetes) -->
  <circle cx="110" cy="140" r="3.5" fill="#FFF59D" stroke="#FFA726" stroke-width="0.5" opacity="0.95" />
  <circle cx="114" cy="144" r="2.5" fill="#FFF59D" opacity="0.9" />
  <circle cx="106" cy="138" r="1.5" fill="#FFF59D" opacity="0.9" />
  <circle cx="120" cy="150" r="2" fill="#FFF59D" opacity="0.9" />
  <!-- Another cluster near outer temporal field -->
  <circle cx="110" cy="250" r="4" fill="#FFF59D" opacity="0.9" />
  <circle cx="116" cy="253" r="2.5" fill="#FFF59D" opacity="0.9" />
  <circle cx="104" cy="246" r="3.2" fill="#FFF59D" opacity="0.9" />

  <!-- CLINICAL MARKERS: Cotton Wool Spots (Micro-infarcts, puffy whites) -->
  <circle cx="180" cy="160" r="8" fill="#FFFFFF" opacity="0.5" filter="url(#glow)" />
  <circle cx="210" cy="240" r="7" fill="#FFFFFF" opacity="0.4" filter="url(#glow)" />
  <circle cx="120" cy="190" r="9" fill="#FFFFFF" opacity="0.45" filter="url(#glow)" />

  <!-- CLINICAL MARKERS: Dot Hemorrhages (Microaneurysm leaks) -->
  <circle cx="140" cy="150" r="3" fill="#800000" />
  <circle cx="160" cy="130" r="2" fill="#800000" />
  <circle cx="190" cy="170" r="2.5" fill="#800000" />
  <circle cx="230" cy="135" r="4.5" fill="#800000" />
  <circle cx="170" cy="260" r="3.5" fill="#800000" />
  <circle cx="130" cy="230" r="2" fill="#800000" />
  <circle cx="90" cy="210" r="3" fill="#800000" />
</svg>
`;

// Preset 3: Hypertensive Retinopathy Fundus
const svgHypertensiveRetina = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FC8D6B" />
      <stop offset="70%" stop-color="#E25D34" />
      <stop offset="100%" stop-color="#802008" />
    </radialGradient>
    <radialGradient id="opticDiscGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF0BE" />
      <stop offset="75%" stop-color="#FFC56C" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="maculaGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9C2F13" />
      <stop offset="60%" stop-color="#B23C1E" />
      <stop offset="100%" stop-color="#E25D34" stop-opacity="0" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Fundus -->
  <circle cx="200" cy="200" r="190" fill="url(#fundusGrad)" stroke="#222" stroke-width="4" />

  <!-- Optic Disc with mild hyperemia -->
  <circle cx="270" cy="200" r="28" fill="url(#opticDiscGrad)" filter="url(#glow)" />

  <!-- Macula -->
  <circle cx="150" cy="204" r="22" fill="url(#maculaGrad)" />
  <circle cx="150" cy="204" r="3" fill="#3D1105" opacity="0.9" />

  <!-- CLINICAL MARKERS: Silver & Copper Wiring Arteries and A-V Nicking (Hypertension signs) -->
  <!-- Venous superior arcade (pushed down by rigid artery - nicking) -->
  <!-- Venue path segment 1 -->
  <path d="M 270 200 Q 250 120 185 118" stroke="#700600" stroke-width="3" fill="none" opacity="0.85" />
  <!-- Gap for arteriovenous compression ("nicking") -->
  <path d="M 175 119 Q 150 120 80 120" stroke="#700600" stroke-width="3" fill="none" opacity="0.85" />

  <!-- Superior Arcade (Arterial - Copper Wiring - Bright shiny gold-orange, rigid, straight, narrow) -->
  <path d="M 270 200 Q 240 135 180 120 T 90 133" stroke="#D4AF37" stroke-width="2.3" fill="none" filter="url(#glow)" />
  <path d="M 270 200 Q 240 135 180 120 T 90 133" stroke="#FFF7C2" stroke-width="0.8" fill="none" />

  <!-- Inferior Venous Arcade with A-V Nicking constriction -->
  <path d="M 270 200 Q 254 280 196 287" stroke="#700600" stroke-width="3" fill="none" opacity="0.85" />
  <path d="M 184 287 Q 150 285 78 280" stroke="#700600" stroke-width="3" fill="none" opacity="0.85" />

  <!-- Inferior Arcade (Arterial - Silver Wiring - High rigidity cross over) -->
  <path d="M 270 200 Q 248 266 190 286 T 88 264" stroke="#E6E6E6" stroke-width="2.2" fill="none" filter="url(#glow)" />
  <path d="M 270 200 Q 248 266 190 286 T 88 264" stroke="#FFFFFF" stroke-width="1.0" fill="none" />

  <!-- Clinical Marker: Flame-Shaped Hemorrhages (Linear brush-bleeds parallel to nerve fiber layer) -->
  <!-- Flame bleed 1 -->
  <path d="M 200 135 L 215 137 L 225 140" stroke="#900" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.9" />
  <path d="M 205 137 L 218 139" stroke="#B00" stroke-width="1" stroke-linecap="round" fill="none" />

  <!-- Flame bleed 2 -->
  <path d="M 220 250 L 235 254 L 244 260" stroke="#900" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.9" />
  
  <!-- Flame bleed 3 -->
  <path d="M 130 150 L 142 148" stroke="#800" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.9" />

  <!-- Clinical Marker: Macular Star (Lipid exudates branching out radially from fovea) -->
  <path d="M 150 204 L 142 195 M 150 204 L 158 195 M 150 204 L 138 204 M 150 204 L 162 204 M 150 204 L 142 213 M 150 204 L 158 213" stroke="#FFF7D1" stroke-width="1.2" fill="none" opacity="0.9" />
</svg>
`;

// Preset 4: Early Alzheimer's Retinal Microvascular Risk Scan
const svgAlzheimersRetina = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="fundusGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FC8D6B" />
      <stop offset="70%" stop-color="#DE552C" />
      <stop offset="100%" stop-color="#731904" />
    </radialGradient>
    <!-- Pale Optic Disc signifying nerve injury/atrophy -->
    <radialGradient id="opticDiscAtrophyGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="#FFF2CE" />
      <stop offset="75%" stop-color="#FFDDAD" />
      <stop offset="100%" stop-color="#DE552C" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="maculaGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9C2F13" />
      <stop offset="60%" stop-color="#B23C1E" />
      <stop offset="100%" stop-color="#DE552C" stop-opacity="0" />
    </radialGradient>
    <filter id="glow2">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background Fundus -->
  <circle cx="200" cy="200" r="190" fill="url(#fundusGrad)" stroke="#222" stroke-width="4" />

  <!-- Optic Disc: PALE & ATROPHIC (Increased cup-to-disc ratio & pallor, common in early Alzheimer's / cognitive risk) -->
  <circle cx="270" cy="200" r="28" fill="url(#opticDiscAtrophyGrad)" filter="url(#glow2)" />
  <!-- Large white inner cup (0.75 cup-disc ratio signifying damage) -->
  <ellipse cx="270" cy="200" rx="14" ry="14" fill="#F7F7F7" opacity="0.8" filter="url(#glow2)" />

  <!-- Macula with thin circulation zone -->
  <circle cx="150" cy="204" r="22" fill="url(#maculaGrad)" />
  <!-- Enlarged Foveal Avascular Zone (FAZ) indicating neurovascular loss -->
  <circle cx="150" cy="204" r="6" fill="#691602" opacity="0.9" />

  <!-- SPARSE / ATTENUATED Arcades (Decreased caliber and simplified bifurcation/fractal dimension) -->
  <!-- Superior Arcade -->
  <path d="M 270 200 Q 250 125 180 120 T 90 130" stroke="#761208" stroke-width="1.8" fill="none" opacity="0.75" />
  <path d="M 270 200 Q 245 133 190 129 T 98 140" stroke="#BF2A18" stroke-width="1.0" fill="none" opacity="0.7" />

  <!-- Inferior Arcade -->
  <path d="M 270 200 Q 254 275 184 280 T 78 272" stroke="#761208" stroke-width="1.8" fill="none" opacity="0.75" />
  <path d="M 270 200 Q 248 266 192 268 T 88 258" stroke="#BF2A18" stroke-width="1.0" fill="none" opacity="0.7" />

  <!-- Absence/Loss of fine branch capillaries (fewer microvascular nodes, a major finding of cognitive neurodegeneration) -->
  <!-- Sparse nasal segments -->
  <path d="M 270 200 C 290 195, 320 190, 345 192" stroke="#A81D10" stroke-width="1.1" fill="none" opacity="0.6" />

  <!-- Retinal Nerve Fiber Layer (RNFL) Defect lines (Radiating black shadows pointing away from disc) -->
  <path d="M 250 185 C 210 160, 180 150, 140 155" stroke="#40302E" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.18" />
  <path d="M 248 175 C 205 145, 170 135, 130 142" stroke="#40302E" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.18" />
  <path d="M 252 215 C 215 240, 185 250, 145 245" stroke="#40302E" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.18" />

  <!-- Analytical Scan reticles highlighting thin zone -->
  <circle cx="150" cy="204" r="45" stroke="#FF5555" stroke-dasharray="1 10" stroke-width="0.8" fill="none" opacity="0.3" />
</svg>
`;

// Helper to convert SVG content into a base64 Data Uri
export function getSvgDataUrl(svgString: string): string {
  const cleanSvg = svgString.trim();
  const base64 = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(cleanSvg))) : Buffer.from(cleanSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'healthy_retina',
    name: 'Patient A: Healthy Control',
    description: 'Pristine ophthalmoscope fundus scan. Uniform arteriole caliber, clear optic nerve margins, healthy foveal zone, and standard capillary plexus.',
    type: 'retina',
    imageUrl: getSvgDataUrl(svgHealthyRetina),
    clinicalLabel: 'Normal Healthy Macula & Nerve Disc'
  },
  {
    id: 'diabetic_retina',
    name: 'Patient B: Glycemic Stress Indicators',
    description: 'Shows classic indicators of Non-Proliferative Diabetic Retinopathy: pinpoint hard microaneurysms, dot/blot flame hemorrhages, and waxy yellow lipid exudates.',
    type: 'retina',
    imageUrl: getSvgDataUrl(svgDiabeticRetina),
    clinicalLabel: 'Microaneurysms & Exudate Leaks Observed'
  },
  {
    id: 'hypertensive_retina',
    name: 'Patient C: Vascular Tension Indicators',
    description: 'Shows distinct signs of Hypertensive Retinopathy Grade III: hardened "copper wiring" vascular caliber, arteriovenous nicking spots, and localized flame brush hemorrhages.',
    type: 'retina',
    imageUrl: getSvgDataUrl(svgHypertensiveRetina),
    clinicalLabel: 'Rigid Arteriolar Caliber & AV Nicking Detected'
  },
  {
    id: 'alzheimers_retina',
    name: 'Patient D: Neurodegenerative Pattern',
    description: 'Shows early indicators associated with Alzheimer\'s Risk: prominent optic disc head pallor, structural nerve fiber layer gaps/thinning, and attenuation of the capillary microvasculature.',
    type: 'retina',
    imageUrl: getSvgDataUrl(svgAlzheimersRetina),
    clinicalLabel: 'RNFL Defect Areas & Optic Nerve Head Pallor'
  }
];
