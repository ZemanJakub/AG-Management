"use client";

import React from "react";

const InformationsPolicy = () => {
  return (
    <div>
      <div className="text-3xl font-bold leading-9 text-default-foreground">
        Zacházení s údaji
      </div>
      <div className="py-4 text-xl font-bold text-secondary-800">
        Než se tě zeptáme na tvé údaje, rádi bychom ti vysvětlili, jak se s nimi naloží.
      </div>
      <div className="space-y-4 text-default-foreground">
        <p>
          V rámci formuláře, který budeš vyplňovat, požadujeme pouze údaje nezbytné k urychlení
          přijímacího pohovoru. Tyto informace jsou vyžadovány za účelem efektivnějšího a
          rychlejšího zpracování tvé žádosti o pracovní místo.
        </p>
        <p>
          Pokud údaje nevyplníš nyní, náš personalista tě k jejich doplnění vyzve během
          přijímacího řízení. Pokud s námi uzavřeš pracovní smlouvu, budou tebou poskytnuté
          údaje dále zpracovávány a uchovávány v rámci interní evidence, a to výhradně za účelem
          splnění zákonných povinností.
        </p>
        <p>
          V případě, že pracovní smlouva nebude uzavřena, tvoje údaje budou automaticky
          odstraněny z naší databáze nejpozději do 30 dnů od ukončení přijímacího procesu.
        </p>
        <p>
          K údajům má až do podpisu pracovní smlouvy přístup pouze tým personalistů. Veškeré
          informace jsou chráněny proti neoprávněnému přístupu a nebudou poskytnuty třetím stranám,
          s výjimkou oprávněných požadavků příslušných úřadů v souladu s platnou legislativou.
        </p>
        <p>
          Děkujeme, že ses rozhodl/a ucházet o pracovní pozici v naší společnosti. Tvoje osobní
          údaje jsou u nás v bezpečí.
        </p>
      </div>    
    </div>
  );
};

export default InformationsPolicy;

