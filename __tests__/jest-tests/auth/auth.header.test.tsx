import { render, screen } from "@testing-library/react";
import AuthHeader from "@/app/(auth)/auth-header";

describe("AuthHeader", () => {
  test("Zobrazí logo s alternativním textem", () => {
    render(<AuthHeader />);
    const logoElement = screen.getByRole("img", { name: /logo/i });
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute("alt", "Logo");
  });

  test("Má kontejner s potřebnými CSS třídami", () => {
    render(<AuthHeader />);

    const container = screen.getByRole("img", { name: /logo/i }).closest("div");
    expect(container).toHaveClass(
      "flex items-center justify-between h-16 px-4 mt-4 sm:px-6 lg:px-8"
    );
  });
});
