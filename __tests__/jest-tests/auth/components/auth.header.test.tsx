import AuthHeader from "@/modules/auth/components/auth-header";
import { render, screen } from "@testing-library/react";


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
       "flex items-center justify-center h-32 mx-auto sm:px-6 lg:px-8 mb-12"
    );
  });
});
