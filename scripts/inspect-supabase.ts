import { createAdminClient } from '@/lib/supabase/admin';
import { inspectConversationData, inspectUserData } from '@/features/debug/supabase-inspector';

function printUsage() {
  console.error(
    [
      'Usage:',
      '  bun run inspect:supabase user <userId>',
      '  bun run inspect:supabase conversation <conversationId>',
    ].join('\n')
  );
}

async function main() {
  const [, , target, id] = process.argv;

  if (!target || !id) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const client = createAdminClient();

  if (target === 'user') {
    console.log(JSON.stringify(await inspectUserData(id, client), null, 2));
    return;
  }

  if (target === 'conversation') {
    console.log(JSON.stringify(await inspectConversationData(id, client), null, 2));
    return;
  }

  printUsage();
  process.exitCode = 1;
}

void main();
