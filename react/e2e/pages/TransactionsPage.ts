import type { Page, Locator } from '@playwright/test';

/** Page Object for the Transactions list. */
export class TransactionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/transactions');
    await this.page.waitForURL('**/transactions');
  }

  /** A transaction row located by its (user-supplied, non-translated)
   *  description text — stable across i18n. */
  row(description: string): Locator {
    return this.page.getByText(description, { exact: false });
  }
}
