import { Migration } from 'mikro-orm';

export class Migration20200822124416 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "email" varchar(255) not null;');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
