
'use client';

import { useState, useEffect, useCallback } from 'react';

// Define the structure of the Chrome AI API
declare global {
  interface Window {
    ai?: {
      canCreateTextSession: () => Promise<'readily' | 'after-download' | 'no'>;
      createTextSession: (options?: {
        topK?: number;
        temperature?: number;
      }) => Promise<AiTextSession>;
    };
  }

  interface AiTextSession {
    prompt: (input: string) => Promise<string>;
    promptStreaming: (input: string) => ReadableStream<string>;
    destroy: () => void;
    execute: (input: string) => Promise<string>;
    executeStreaming: (input: string) => ReadableStream<string>;
  }
}

type AiSessions = {
  summarizer?: AiTextSession;
  proofreader?: AiTextSession;
  writer?: AiTextSession;
  rewriter?: AiTextSession;
  translator?: AiTextSession;
};

export function useChromeAi() {
  const [aiAvailable, setAiAvailable] = useState(false);
  const [sessions, setSessions] = useState<AiSessions>({});

  useEffect(() => {
    const initializeAi = async () => {
      if (window.ai && (await window.ai.canCreateTextSession()) === 'readily') {
        setAiAvailable(true);
        const [summarizer, proofreader, writer, rewriter, translator] = await Promise.all([
            window.ai.createTextSession({ topK: 3, temperature: 0.3 }),
            window.ai.createTextSession({ topK: 3, temperature: 0.3 }),
            window.ai.createTextSession({ topK: 5, temperature: 1.0 }),
            window.ai.createTextSession({ topK: 5, temperature: 0.8 }),
            window.ai.createTextSession({ topK: 3, temperature: 0.3 })
        ]);
        setSessions({ summarizer, proofreader, writer, rewriter, translator });
      } else {
        setAiAvailable(false);
      }
    };
    initializeAi();

    return () => {
        Object.values(sessions).forEach(session => session?.destroy());
    };
  }, []);

  const callAi = useCallback(
    async (sessionType: keyof AiSessions, prompt: string, streamCallback?: (chunk: string) => void) => {
      const session = sessions[sessionType];
      if (!session) {
        throw new Error(`AI session "${sessionType}" is not available.`);
      }

      if (streamCallback) {
        const stream = session.promptStreaming(prompt);
        const reader = stream.getReader();
        let fullResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += value;
          streamCallback(fullResponse);
        }
        return fullResponse;
      } else {
        return session.prompt(prompt);
      }
    },
    [sessions]
  );

  const summarize = useCallback((text: string, onStream?: (chunk: string) => void) => {
    return callAi('summarizer', `Summarize the following text:\n${text}`, onStream);
  }, [callAi]);

  const proofread = useCallback((text: string, onStream?: (chunk: string) => void) => {
    return callAi('proofreader', `Proofread the following text, correcting any grammar and spelling mistakes. Only return the corrected text:\n${text}`, onStream);
  }, [callAi]);

  const write = useCallback((prompt: string, onStream?: (chunk: string) => void) => {
    return callAi('writer', prompt, onStream);
  }, [callAi]);
  
  const rewrite = useCallback((prompt: string, onStream?: (chunk: string) => void) => {
    return callAi('rewriter', `Rewrite the following text to improve its clarity and flow. If a tone is specified, adapt to it:\n${prompt}`, onStream);
  }, [callAi]);

  const translate = useCallback((text: string, targetLanguage: string, onStream?: (chunk: string) => void) => {
    return callAi('translator', `Translate the following text to ${targetLanguage}:\n${text}`, onStream);
  }, [callAi]);

  return {
    aiAvailable,
    summarize,
    proofread,
    write,
    rewrite,
    translate,
  };
}
