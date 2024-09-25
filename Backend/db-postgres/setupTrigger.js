const prisma = require('../prisma/prismaClient');

async function setupDatabase() {
  try {
    // Create or replace the trigger function
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION notify_slot_change()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify('slot_change', json_build_object(
          'area_id', NEW."AreaID",
          'is_busy', NEW."Busy"
        )::text);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Check if the trigger already exists before creating it
    const existingTrigger = await prisma.$queryRaw`
      SELECT tgname
      FROM pg_trigger
      WHERE tgname = 'slot_change_trigger';
    `;

    if (existingTrigger.length === 0) {
      // Create the trigger if it doesn't exist
      await prisma.$executeRaw`
        CREATE TRIGGER slot_change_trigger
        AFTER INSERT OR UPDATE ON "Slots"
        FOR EACH ROW
        EXECUTE FUNCTION notify_slot_change();
      `;

      console.log('Trigger created successfully.');
    } else {
      console.log('Trigger already exists, no action taken.');
    }
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
