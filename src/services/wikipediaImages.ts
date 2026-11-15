// Wikipedia REST API Image Service
// Fetches official dynamic high-resolution photos for Earth analog sites and planetary targets
// with zero API keys required (Access-Control-Allow-Origin: *).
import { useState, useEffect } from 'react';

export interface WikiEntry {
  slug: string;
  lang?: string;
  fallbackSlug?: string;
  staticBackup: string;
}

export const WIKIPEDIA_TARGET_REGISTRY: Record<string, WikiEntry> = {
  // 14 Earth Analog Sites
  'ATC-01': {
    slug: 'Valle_de_la_Luna_(Chile)',
    fallbackSlug: 'Atacama_Desert',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Valle_della_Luna_01.jpg',
  },
  'HGT-02': {
    slug: 'Haughton_impact_crater',
    fallbackSlug: 'Devon_Island',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Truelove_Lowlands_Devon_Island.jpg',
  },
  'LNZ-03': {
    slug: 'Cueva_de_los_Verdes',
    staticBackup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Lanzarote_5_Luc_Viatour.jpg/1280px-Lanzarote_5_Luc_Viatour.jpg',
  },
  'PIN-04': {
    slug: 'El_Pinacate_y_Gran_Desierto_de_Altar_Biosphere_Reserve',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Reserva_de_la_Bi%C3%B3sfera_%E2%80%9CEl_Pinacate%E2%80%9D.jpg',
  },
  'MCM-05': {
    slug: 'Wright_Valley',
    fallbackSlug: 'McMurdo_Dry_Valleys',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Wright_Valley_From_Bull_Pass.jpg',
  },
  'PUN-06': {
    slug: '%C3%81rea_natural_protegida_Campo_de_Piedra_P%C3%B3mez',
    lang: 'es',
    fallbackSlug: 'Puna_de_Atacama',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Campo_de_Piedra_P%C3%B3mez%2C_Catamarca%2C_Argentina.jpg',
  },
  'ASK-07': {
    slug: 'Askja',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Askja.jpg',
  },
  'DNK-08': {
    slug: 'Dallol_(volcano)',
    staticBackup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/ET_Afar_asv2018-01_img48_Dallol.jpg/1280px-ET_Afar_asv2018-01_img48_Dallol.jpg',
  },
  'PAY-09': {
    slug: 'Reserva_provincial_La_Payunia',
    lang: 'es',
    fallbackSlug: 'Payunia_Volcanic_Field',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/9/91/La_Payunia_Provincial_Reserve.JPG',
  },
  'SLD-10': {
    slug: 'Lake_Salda',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Lake_Salda_in_June_2020.jpg',
  },
  'UYU-11': {
    slug: 'Salar_de_Uyuni',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Salar_Uyuni_au01.jpg',
  },
  'OJS-12': {
    slug: 'Ojos_del_Salado',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Ojos_del_Salado_looming_big_on_the_horizon.jpg',
  },
  'BAR-13': {
    slug: 'Meteor_Crater',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Meteor_Crater_-_Arizona.jpg',
  },
  'RIO-14': {
    slug: 'Rio_Tinto_(river)',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Rio_tinto_river_CarolStoker_NASA_Ames_Research_Center.jpg',
  },

  // 4 Extraterrestrial Targets
  'MOON-SHK': {
    slug: 'Shackleton_(crater)',
    fallbackSlug: 'Lunar_south_pole',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Lunar_south_pole_summer_annotated.jpg',
  },
  'MOON-COP': {
    slug: 'Copernicus_(lunar_crater)',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Copernicus_%28LRO%29_2.png',
  },
  'MOON-LAV': {
    slug: 'Mare_Tranquillitatis',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Mare_Tranquillitatis_pit_crater.jpg',
  },
  'MARS-JEZ': {
    slug: 'Jezero_(crater)',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Perseverance%27s_First_Full-Color_Look_at_Mars.png',
  },
  'MARS-ALB': {
    slug: 'Alba_Mons',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Alba_Mons_Viking_DIM.jpg',
  },
  'MARS-ARC': {
    slug: 'Arcadia_Planitia',
    staticBackup: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
  },
};

// Global in-memory cache initialized with guaranteed static backups
const imageCache = new Map<string, string>();
const listeners = new Set<() => void>();

// Initialize cache with static backups
Object.entries(WIKIPEDIA_TARGET_REGISTRY).forEach(([id, entry]) => {
  imageCache.set(id, entry.staticBackup);
});

// Fetch a single entry from Wikipedia REST API
async function fetchWikiImage(id: string, entry: WikiEntry): Promise<void> {
  const lang = entry.lang || 'en';
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${entry.slug}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok && entry.fallbackSlug) {
      // Try fallback slug
      const fallbackUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${entry.fallbackSlug}`;
      const fbRes = await fetch(fallbackUrl);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        const src = fbData.originalimage?.source || fbData.thumbnail?.source;
        if (src) {
          imageCache.set(id, src);
          listeners.forEach((fn) => fn());
          return;
        }
      }
    }

    if (res.ok) {
      const data = await res.json();
      const src = data.originalimage?.source || data.thumbnail?.source;
      if (src) {
        imageCache.set(id, src);
        listeners.forEach((fn) => fn());
      }
    }
  } catch {
    // If fetch fails, keep staticBackup
  }
}

// Prefetch all images in the background once
let prefetchStarted = false;
export function prefetchAllWikipediaImages(): void {
  if (prefetchStarted) return;
  prefetchStarted = true;

  Object.entries(WIKIPEDIA_TARGET_REGISTRY).forEach(([id, entry], index) => {
    // Stagger slightly to be polite to Wikipedia API
    setTimeout(() => {
      fetchWikiImage(id, entry);
    }, index * 80);
  });
}

// Automatically initiate prefetch when this module is imported in browser
if (typeof window !== 'undefined') {
  prefetchAllWikipediaImages();
}

/**
 * Returns the current cached Wikipedia image URL for a given site or target ID.
 */
export function getWikipediaImageUrl(id: string): string {
  return imageCache.get(id) || WIKIPEDIA_TARGET_REGISTRY[id]?.staticBackup || '';
}

/**
 * React hook that returns the live Wikipedia image URL and rerenders when updated.
 */
export function useWikipediaImage(id: string): string {
  const [url, setUrl] = useState<string>(() => getWikipediaImageUrl(id));

  useEffect(() => {
    setUrl(getWikipediaImageUrl(id));

    const handleChange = () => {
      setUrl(getWikipediaImageUrl(id));
    };

    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, [id]);

  return url;
}
