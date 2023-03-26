import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.10/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(`
      ALTER TABLE public.topics ADD COLUMN account_id INT NOT NULL CONSTRAINT topics_accounts_fkey_account_id REFERENCES public.accounts(id);
    `);
  }
  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.queryArray(`
      ALTER TABLE public.topics DROP COLUMN account_id;
    `);
  }
}
