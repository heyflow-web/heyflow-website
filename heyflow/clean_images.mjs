import fs from 'fs';
import path from 'path';

const dir = './public/images/projects';
const files = fs.readdirSync(dir);

let deletedCount = 0;
for (const file of files) {
  // match exact hex strings like proj-37ab1670-hero.png or proj-37ab16703d4f8000935ce10489a89903-mobile.png
  if (/^proj-[a-f0-9]+-(pc|mobile|hero)\.png$/.test(file)) {
    console.log('Deleting:', file);
    fs.unlinkSync(path.join(dir, file));
    deletedCount++;
  }
}

console.log(`Deleted ${deletedCount} obsolete hex-named images.`);
