declare global {
    /**
     * Helper funkce pro vytvoření FormData objektu z objektu s daty
     * @param data Objekt s daty pro FormData
     * @returns FormData objekt obsahující zadaná data
     */
    function createTestFormData<T extends Record<string, any>>(data: T): FormData;
  }
  
  export {};