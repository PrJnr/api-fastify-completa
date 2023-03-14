import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("documentos", (table) => {
    table.decimal("amount", 9, 2).after("title");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("documentos", (table) => {
    table.dropColumn("amount");
  });
}
