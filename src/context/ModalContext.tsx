import React, { createContext, useReducer, useCallback } from "react";
import type { ModalKey, ModalState, ModalAction } from "@/types/modal.types";

interface ModalContextValue {
  activeKey: ModalKey | null;
  payload: Record<string, unknown>;
  openModal: (key: ModalKey, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const initialState: ModalState = { activeKey: null, payload: {} };

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN":
      return { activeKey: action.key, payload: action.payload ?? {} };
    case "CLOSE":
      return initialState;
    default:
      return state;
  }
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  const openModal = useCallback((key: ModalKey, payload?: Record<string, unknown>) => {
    dispatch({ type: "OPEN", key, payload });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, []);

  return (
    <ModalContext.Provider value={{ activeKey: state.activeKey, payload: state.payload, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
