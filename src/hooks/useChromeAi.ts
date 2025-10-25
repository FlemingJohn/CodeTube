
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
  promptImprover?: AiTextSession;
};

export function useChromeAi() {
  const [sessions, setSessions] = useState<AiSessions>({});
  const [aiAvailable, setAiAvailable] = useState(false);


  useEffect(() => {
    const initializeAi = async () => {
      if (typeof window.ai?.canCreateTextSession !== 'function') {
        setAiAvailable(false);
        return;
      }

      if ((await window.ai.canCreateTextSession()) === 'readily') {
        setAiAvailable(true);
        const [summarizer, proofreader, writer, rewriter, translator, promptImprover] = await Promise.all([
            window.ai.createTextSession({ topK: 3, temperature: 0.3 }),
            window.ai.createTextSession({ topK: 3, temperature: 0.3 }),
            window.ai.createTextSession({ topK: 5, temperature: 1.0 }),
            window.ai.createTextSession({ topK: 5, temperature: 0.8 }),
            window.ai.createTextSession({ topK: 3, temperature: 0.3 }),
            window.ai.createTextSession({ topK: 3, temperature: 0.7 })
        ]);
        setSessions({ summarizer, proofreader, writer, rewriter, translator, promptImprover });
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

  const summarize = useCallback((text: string, title: string, onStream?: (chunk: string) => void) => {
    const prompt = `You are an expert educator. Create concise notes in bullet points for a chapter titled "${title}" based on the following transcript:\n\n${text}`;
    return callAi('summarizer', prompt, onStream);
  }, [callAi]);

  const proofread = useCallback((text: string, onStream?: (chunk: string) => void) => {
    const prompt = `Proofread the following text, correcting any grammar and spelling mistakes. Only return the corrected text, without any introductory phrases:\n\n'${text}'`;
    return callAi('proofreader', prompt, onStream);
  }, [callAi]);

  const write = useCallback((prompt: string, onStream?: (chunk: string) => void) => {
    return callAi('writer', prompt, onStream);
  }, [callAi]);
  
  const rewrite = useCallback((text: string, tone?: string, onStream?: (chunk: string) => void) => {
    const prompt = `Rewrite the following text to improve its clarity and flow. ${tone ? `Adapt to a ${tone} tone.` : ''} Only return the rewritten text, without any introductory phrases:\n\n'${text}'`;
    return callAi('rewriter', prompt, onStream);
  }, [callAi]);

  const improvePrompt = useCallback((text: string, onStream?: (chunk: string) => void) => {
    const prompt = `You are an expert prompt engineer. The user wants to generate a learning plan. Take their simple input and expand it into a detailed, effective prompt. For example, if the user provides "learn python", you could return "Create a comprehensive learning plan for a beginner to learn Python for data analysis, including key concepts and a step-by-step roadmap."
    
    User input: "${text}"
    
    Improved prompt:`;
    return callAi('promptImprover', prompt, onStream);
  }, [callAi]);

  const translate = useCallback((text: string, targetLanguage: string, onStream?: (chunk: string) => void) => {
    const prompt = `Translate this text into ${targetLanguage} while keeping the original meaning, clarity, and educational tone intact:\n\n${text}`;
    return callAi('translator', prompt, onStream);
  }, [callAi]);

  return {
    aiAvailable,
    summarize,
    proofread,
    write,
    rewrite,
    translate,
    improvePrompt,
  };
}

    