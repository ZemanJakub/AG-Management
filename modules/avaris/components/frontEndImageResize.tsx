"use client";

import { useEffect } from 'react';


export const handleFileConvert = async (file: File): Promise<Blob|Blob[]> => {
  try {
    if (typeof window !== 'undefined') {
      const heic2any = (await import('heic2any')).default;
      try {
        let convertedBlob: Blob | Blob[] = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8 // Nastavte požadovanou kvalitu JPEG (0 až 1)
        });

        if (Array.isArray(convertedBlob) && convertedBlob[0].size > 1024 * 1024) {
            convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.5
            });
        }

        return convertedBlob;
      } catch (error) {
        console.error(error);
        throw new Error('Chyba při konverzi souboru.');
      }
    } else {
      throw new Error('Modul heic2any nelze načíst na serveru.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Chyba při konverzi souboru.');
  }
};




