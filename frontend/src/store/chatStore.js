import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  messages: [],
  caseId: null,
  stage: "intake", // intake | questions | generating | document | summary
  currentQuestions: [],
  answers: {},
  isTyping: false,
  error: null,
  language: "en", // en | hi | hinglish

  setLanguage: (lang) => set({ language: lang }),
  setStage: (stage) => set({ stage }),
  setCaseId: (id) => set({ caseId: id }),
  setTyping: (val) => set({ isTyping: val }),
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: Date.now(), timestamp: new Date().toISOString(), ...msg },
      ],
    })),

  setAnswer: (qId, value) =>
    set((s) => ({ answers: { ...s.answers, [qId]: value } })),

  setQuestions: (questions) => set({ currentQuestions: questions }),

  reset: () =>
    set({
      messages: [],
      caseId: null,
      stage: "intake",
      currentQuestions: [],
      answers: {},
      isTyping: false,
      error: null,
    }),
}));
