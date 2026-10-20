import { useEffect } from 'react';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const full = title ? `${title} | CopyCraft AI` : 'CopyCraft AI: Website Copy Generator for Local Businesses';
    document.title = full;
    setMeta('property', 'og:title', full);
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
  }, [title, description]);
}
