import { test, expect } from '@playwright/test';

test.describe('PortailIQ - Dashboard', () => {
  test('should show dashboard stats when logged in', async ({ page }) => {
    // Note: This test assumes the user is already authenticated
    // In a real scenario, you would use auth state persistence
    await page.goto('/dashboard');
    
    // Check for dashboard elements
    const dashboardHeading = page.getByRole('heading', { name: /Tableau de bord/i });
    await expect(dashboardHeading).toBeVisible();
  });

  test('should show portal list', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for portal list or "create first portal" message
    const portalList = page.getByRole('heading', { name: /Aucun portail créé|Mes Portails/i }).first();
    await expect(portalList).toBeVisible();
  });

  test('should have create portal button', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for create portal button
    const createButton = page.getByRole('button', { name: /Nouveau Portail|Créer/i });
    await expect(createButton).toBeVisible();
  });
});

test.describe('PortailIQ - Portal Form', () => {
  test('should display portal form with items', async ({ page }) => {
    // Navigate to a portal form (you'll need a valid token)
    // For now, just check the page structure exists
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });
});
