import { useState, useCallback } from 'react';

/**
 * Hook for copy-to-clipboard with temporary "Copied!" feedback.
 */
export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState(null);

  const copy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copy, copiedId };
}
