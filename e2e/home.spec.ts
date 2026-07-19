import { test, expect } from '@playwright/test';

test.describe('PortailIQ - Home Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*PortaiLIQ.*/i);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for key navigation elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });
});

test.describe('PortailIQ - Authentication', () => {
  test('should have signin and signup links', async ({ page }) => {
    await page.goto('/');
    
    // Check for auth links
    const signinLink = page.getByRole('link', { name: /signin|se connecter/i }).first();
    const signupLink = page.getByRole('link', { name: /signup|s'inscrire/i }).first();
    
    // At least one should exist
    await expect(signinLink.or(signupLink)).toBeVisible();
  });
});
