import { scanImportFolder } from './lib/import-library.mjs';

const result = await scanImportFolder(process.cwd());

console.log(`Scanned ${result.scannedFiles} source file(s).`);
console.log(`Imported ${result.importedFiles} file(s).`);
console.log(`Parsed ${result.parsedNotes} note(s).`);
