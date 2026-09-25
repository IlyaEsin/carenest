import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../testing/render';
import { ThemeSwitcher } from './ThemeSwitcher';
import { readThemePreference, resolveTheme, themeStorageKey } from './theme';

function mockSystemDark(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('resolveTheme', () => {
  it('follows the system only when the preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('starts from the system theme', () => {
    mockSystemDark(true);

    renderWithProviders(<ThemeSwitcher />);

    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('applies and remembers an explicit choice', async () => {
    mockSystemDark(true);
    renderWithProviders(<ThemeSwitcher />);

    await userEvent.click(screen.getByRole('button', { name: 'Light' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(themeStorageKey)).toBe('light');
    expect(readThemePreference()).toBe('light');
  });

  it('forgets the choice when switching back to system', async () => {
    mockSystemDark(false);
    localStorage.setItem(themeStorageKey, 'dark');
    renderWithProviders(<ThemeSwitcher />);

    await userEvent.click(screen.getByRole('button', { name: 'System' }));

    expect(localStorage.getItem(themeStorageKey)).toBeNull();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
