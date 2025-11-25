import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1764047715061 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1764047715061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create refresh_tokens table ONLY — no altering users table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "revoked" boolean NOT NULL DEFAULT false,
        "ip_address" character varying(255),
        "user_agent" character varying(255),

        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "refresh_tokens";
    `);
  }
}
