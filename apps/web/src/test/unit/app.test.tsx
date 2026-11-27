import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../App";

describe("App", () => {
  it("renders the workspace scaffold heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Workspace scaffold ready",
        level: 1,
      }),
    ).toBeInTheDocument();
  });
});
