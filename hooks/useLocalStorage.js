import { useState, useEffect } from 'react';

// Hook personalizado para substituir o useStoredState do Hatch
export function useStoredState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage para ${key}:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Erro ao salvar no localStorage para ${key}:`, error);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

// Hook para simular useUser do Hatch
export function useUser() {
  return {
    id: 'user_local',
    name: 'Usuário Local',
    color: '#2563eb'
  };
}
