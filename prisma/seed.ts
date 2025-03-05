import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //suppression de tous les posts (voir pages 29 du cours)
  await prisma.pokemonCard.deleteMany();
  await prisma.user.deleteMany();
  await prisma.type.deleteMany();
  await prisma.type.createMany({
    data: [
      { name: 'Normal' },
      { name: 'Fire' },
      { name: 'Water' },
      { name: 'Grass' },
      { name: 'Electric' },
      { name: 'Ice' },
      { name: 'Fighting' },
      { name: 'Poison' },
      { name: 'Ground' },
      { name: 'Flying' },
      { name: 'Psychic' },
      { name: 'Bug' },
      { name: 'Rock' },
      { name: 'Ghost' },
      { name: 'Dragon' },
      { name: 'Dark' },
      { name: 'Steel' },
      { name: 'Fairy' },
    ],
  });


  const fireType = await prisma.type.findUnique({where: {name: "Fire"}});
  const fairyType = await prisma.type.findUnique({where: {name: "Fairy"}});

  if (!fireType || !fairyType) {
    throw new Error("Erreur : un des types n'a pas été trouvé !");
  }

  await prisma.pokemonCard.create({
    data:{ 
      name: 'Flamiaou',
      pokedexId: 725 ,
      type: {connect: {id: fireType.id}} ,
      lifePoints: 70 ,
      size: 0.7 ,
      weight: 4 ,
      imageUrl: "https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png" 
    },

  });

  await prisma.pokemonCard.create({
    data:{
      name: 'Nymphali',
      pokedexId: 700,
      type: {connect: {id: fairyType.id}},
      lifePoints: 90,
      size: 0.8 ,
      weight: 7 ,
      imageUrl: "https://www.pokepedia.fr/images/thumb/8/83/Nymphali-XY.png/800px-Nymphali-XY.png" 
    },
  });

  await prisma.user.create({
    data:{
      email: "admin@gmail.com",
      password: "admin"
    }
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
