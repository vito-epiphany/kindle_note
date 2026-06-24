import { buildSite } from './lib/build-site.mjs';

const { books } = await buildSite(process.cwd());

console.log(`Built ${books.length} book page(s).`);
