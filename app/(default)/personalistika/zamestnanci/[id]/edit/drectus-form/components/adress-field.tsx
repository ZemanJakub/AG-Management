import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { FormElement } from "./types";

interface AddressInputProps {
  element: FormElement;
  defaultValue: string; // Výchozí hodnota pro neřízený formulář
  error?: string | any; // Chybová hláška
}

const AddressField = ({ element, defaultValue, error }: AddressInputProps) => {
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Uchování hodnoty adresy pomocí useState
  const [addressValue, setAddressValue] = useState(defaultValue);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        console.log("Google Maps API loaded successfully.");
        if (searchRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
            types: ["address"],
            componentRestrictions: { country: ["cz", "sk"] },
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
              setAddressValue(place.formatted_address); // Aktualizace stavu adresy
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps API:", error);
      });
  }, []);

  return (
    <div className="w-full mb-5">
      <label className="block text-sm font-medium mb-1" htmlFor={element.key}>
        {element.label}
      </label>
      <input
        className="form-input w-full"
        id={element.key}
        name={element.key}
        ref={searchRef}
        type="text"
        value={addressValue} // Přepnuto na řízenou hodnotu
        onChange={(e) => setAddressValue(e.target.value)} // Uložení změn do stavu
      />
      {error && (
        <div className="text-xs mt-1 text-rose-500">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AddressField;


