import { Communicator, CommunicatorContext, TransactionContext, Transaction, Workflow, WorkflowContext, GetApi, ArgSource, ArgSources } from '@dbos-inc/dbos-sdk';
import { Knex } from 'knex';

// The schema of the database table used in this example.
export interface dbos_hello {
  name: string;
  greet_count: number;
}

export class Greetings {
  @Communicator()
  static async SendEmail(ctxt: CommunicatorContext, friend: string, content: string) {
    ctxt.logger.info(`Sending email "${content}" to ${friend}...`);
    // Code omitted for simplicity
    ctxt.logger.info("Email sent!");
  }

  @Transaction()
  static async InsertGreeting(ctxt: TransactionContext<Knex>, friend: string, content: string) {
    await ctxt.client.raw(
      "INSERT INTO dbos_greetings (greeting_name, greeting_note_content) VALUES (?, ?)",
      [friend, content]
    );
  }

  @Workflow()
  @GetApi("/greeting/:friend")
  static async GreetingWorkflow(ctxt: WorkflowContext, friend: string) {
    const noteContent = `Thank you for being an awesome friend, ${friend}`;
    await ctxt.invoke(Greetings).SendEmail(friend, noteContent);
    for (let i = 0; i < 5; i++) {
      ctxt.logger.info(
          "Press control + C to interrupt the workflow..."
      );
      await ctxt.sleep(1);
    }
    await ctxt.invoke(Greetings).InsertGreeting(friend, noteContent);
    ctxt.logger.info(`Greeting sent to ${friend}`);
    return noteContent;
  }
}
