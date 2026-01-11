const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
console.log('[seed] cwd=', process.cwd());
console.log('[seed] DATABASE_URL=', process.env.DATABASE_URL);
async function main() {
  console.log('Seeding database...');

  // Amenities
  const amenitiesData = JSON.parse(fs.readFileSync('./src/data/amenities.json'));
  for (const amenity of amenitiesData.amenities) {
    await prisma.amenity.create({ data: amenity });
  }
  console.log('Amenities seeded');

  // Hosts
  const hostsData = JSON.parse(fs.readFileSync('./src/data/hosts.json'));
  for (const host of hostsData.hosts) {
    await prisma.host.create({ data: host });
  }
  console.log('Hosts seeded');

  // Users
  const usersData = JSON.parse(fs.readFileSync('./src/data/users.json'));
  for (const user of usersData.users) {
    await prisma.user.create({ data: user });
  }
  console.log('Users seeded');

  // Properties
  const propertiesData = JSON.parse(fs.readFileSync('./src/data/properties.json'));
  for (const property of propertiesData.properties) {
    await prisma.property.create({ data: property });
  }
  console.log('Properties seeded');

  // Bookings
  const bookingsData = JSON.parse(fs.readFileSync('./src/data/bookings.json'));
  for (const booking of bookingsData.bookings) {
    await prisma.booking.create({ data: booking });
  }
  console.log('Bookings seeded');

  // Reviews
  const reviewsData = JSON.parse(fs.readFileSync('./src/data/reviews.json'));
  for (const review of reviewsData.reviews) {
    await prisma.review.create({ data: review });
  }
  console.log('Reviews seeded');
  async function ensureFixedRecords() {
    const FIXED_PROPERTY_ID = 'h0123456-78f0-1234-5678-9abcdef01234';

    const SAFE_HOST_ID = '99999999-9999-9999-9999-999999999999';

    // гарантия хоста
    let safeHost = await prisma.host.findUnique({ where: { id: SAFE_HOST_ID } });
    if (!safeHost) {
      safeHost = await prisma.host.create({
        data: {
          id: SAFE_HOST_ID,
          username: 'fixed-prop-host',
          password: 'fixed-pass',
          name: 'Fixed Prop Host',
          email: 'fixed-host@example.com',
          phoneNumber: '',
          pictureUrl: '',
          aboutMe: '',
        },
      });
    }

    await prisma.property.upsert({
      where: { id: FIXED_PROPERTY_ID },
      update: {
        hostId: safeHost.id,             
      },
      create: {
        id: FIXED_PROPERTY_ID,
        title: 'Cozy Mountain Retreat',
        description: 'Seeded record for tests',
        location: 'Malibu, California',
        pricePerNight: 310.25,
        bedroomCount: 3,
        bathroomCount: 2,
        maxGuestCount: 5,
        rating: 5,
        hostId: safeHost.id,
      },
    });

    const ok = await prisma.property.findUnique({ where: { id: FIXED_PROPERTY_ID }, select: { id: true, hostId: true } });
    console.log('[seed] ensured fixed property, hostId=', ok?.hostId);
  }
  const check = await prisma.property.findUnique({ where: { id: 'h0123456-78f0-1234-5678-9abcdef01234' }, select: { id:true } });
  console.log('[seed] exists after upsert =', !!check);
  await ensureFixedRecords();

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
