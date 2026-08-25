/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfileControls } from "./ProfileControls";

describe("ProfileControls", () => {
  afterEach(() => cleanup());

  it("persists a selected Indian language through the language callback", async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    render(<ProfileControls name="Mira" language="auto" onLanguageChange={onLanguageChange} onUpgrade={vi.fn()} onManagePlan={vi.fn()} onLogout={vi.fn()} />);

    await user.selectOptions(screen.getByRole("combobox", { name: /response and voice language/i }), "te");

    expect(onLanguageChange).toHaveBeenCalledWith("te");
    expect(screen.getByRole("option", { name: /Telugu/i })).toBeTruthy();
  });

  it("gives a Pro subscriber a plan-management entry point rather than an upgrade-only control", async () => {
    const user = userEvent.setup();
    const onManagePlan = vi.fn();
    render(<ProfileControls name="Mira" language="hi" onLanguageChange={vi.fn()} subscription={{ plan: "pro", status: "active", cancelAtPeriodEnd: false, hasBillingPortal: true }} onUpgrade={vi.fn()} onManagePlan={onManagePlan} onLogout={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /manage or cancel plan/i }));

    expect(onManagePlan).toHaveBeenCalledTimes(1);
  });
});
