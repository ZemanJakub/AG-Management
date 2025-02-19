import { fetchMyForm } from "@/queries/employees";
import { describe, test, expect, jest } from "@jest/globals";
import { directus } from "@/app/lib/directus";
import { MyFormData } from "@/components/directus-form/components/types";

// ✅ Definujeme mock Directus SDK s generikou
jest.mock("@/app/lib/directus", () => ({
  directus: {
    request: jest.fn() as jest.MockedFunction<typeof directus.request>,
  },
}));

describe("fetchMyForm", () => {
  const mockFormData: MyFormData[] = [
    {
      id: "bd647bc9-0324-4cfc-b07e-5208eb1f50b4",
      name: "testForm",
      elements: [
        { id: "8fe93a27-861e-4d96-b642-b4ecf1c81da0", key: "firstName", label: "Jméno", type: "input", required: true, order: 1 },
        { id: "27dc930e-a2d3-4c51-9c36-109d9b85a6f2", key: "email", label: "Email", type: "email", required: true, order: 8 },
      ],
    },
  ];

  test("Vrací správná data z Directus", async () => {
    (directus.request as jest.MockedFunction<typeof directus.request>).mockResolvedValue(mockFormData);
  
    const form = await fetchMyForm("bd647bc9-0324-4cfc-b07e-5208eb1f50b4");
  
    // ✅ Ověření, že funkce vrací správná data
    expect(form).toEqual(mockFormData);
  
    // ✅ Ověření, že `directus.request` byl zavolán přesně jednou
    expect(directus.request).toHaveBeenCalledTimes(1);
  });
  
});



//basicuser Id 6d480987-d57d-4e14-a97e-8a97d7b82b37