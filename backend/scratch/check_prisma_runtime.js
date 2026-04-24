const prisma = require("../src/prisma");

async function check() {
  try {
    console.log("Fields in Cv model (from DMMF if possible):");
    // Prisma internal dmmf might have this info
    const dmmf = prisma._dmmf;
    if (dmmf) {
      const cvModel = dmmf.datamodel.models.find(m => m.name === "Cv");
      if (cvModel) {
        console.log("Cv Model found in DMMF:");
        cvModel.fields.forEach(f => {
          console.log(` - ${f.name}: ${f.type} (kind: ${f.kind})`);
        });
      } else {
        console.log("Cv Model NOT found in DMMF");
      }
    } else {
      console.log("DMMF not accessible");
    }

    console.log("\nTrying to call prisma.cv.create with just titre and contenu to see if it works...");
    // This is just a dry run check - we won't actually call it if we can't provide required fields,
    // but we can check the keys of the object.
    console.log("prisma.cv keys:", Object.keys(prisma.cv));
    
  } catch (error) {
    console.error("Error checking prisma:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
