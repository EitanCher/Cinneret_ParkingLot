// setup-trigger.js

const prisma = require('../prisma/prismaClient');

async function setupDatabase() {
  try {
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

    await prisma.$executeRaw`
        CREATE TRIGGER slot_change_trigger
        AFTER INSERT OR UPDATE ON "Slots"
        FOR EACH ROW
        EXECUTE FUNCTION notify_slot_change();
      `;

    console.log('Trigger setup completed.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}
setupDatabase();
