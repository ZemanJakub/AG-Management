declare global {
    interface Window {
      AdobeAn: any;
      // Můžeš také přidat další vlastnosti, které exportuje Pes.js, např. init, exportRoot, stage, fnStartAnimation...
      init: () => void;
      exportRoot: any;
      stage: any;
      fnStartAnimation: () => void;
    }
  }