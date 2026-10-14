import { useEffect, useState } from 'react';
import { api } from '../../../api/client.js';
import { FALLBACK_CONTENT } from './fallbackContent.js';

const CACHE_KEY = 'qlc_public_content';
const CACHE_TTL = 5 * 60 * 1000;

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    return cached && Date.now() - cached.at < CACHE_TTL ? cached.data : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    return undefined;
  }
  return undefined;
}

export function usePublicContent() {
  const [content, setContent] = useState(() => readCache() || FALLBACK_CONTENT);

  useEffect(() => {
    if (readCache()) return undefined;
    let alive = true;
    api.get('/public/content')
      .then((data) => {
        if (!alive || !data?.sections?.length) return;
        writeCache(data);
        setContent(data);
      })
      .catch(() => null);
    return () => { alive = false; };
  }, []);

  return content;
}
