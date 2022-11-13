import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.10/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(`
      CREATE FUNCTION topics_set_update_time() RETURNS trigger AS '
            begin
              new.updated_at := ''now'';
              return new;
            end;
          ' LANGUAGE plpgsql;
          CREATE TRIGGER update_trigger BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE PROCEDURE topics_set_update_time();
      `);
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.queryArray(
      "DROP FUNCTION IF EXISTS topics_set_update_time() CASCADE;",
    );
  }
}
