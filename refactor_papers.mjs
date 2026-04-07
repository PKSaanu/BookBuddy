import fs from 'fs';
import path from 'path';

const sourceDir = './src/app/books/[id]';
const destDir = './src/app/papers/[id]';

// Ensure destDir exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy and modify files
const files = fs.readdirSync(sourceDir);

for (const file of files) {
  const sourceFile = path.join(sourceDir, file);
  // Rename book-* to paper-*
  const destFileName = file.replace(/book/g, 'paper');
  const destFile = path.join(destDir, destFileName);

  let content = fs.readFileSync(sourceFile, 'utf8');

  // Perform replacements strictly
  content = content.replace(/import \{ getBookNotes, removeBookFile \}/g, 'import { getPaperNotes, removePaperFile }');
  content = content.replace(/from '\.\/book/g, "from './paper");
  content = content.replace(/from '\.\/edit-book/g, "from './edit-paper");
  content = content.replace(/from '\.\/delete-book/g, "from './delete-paper");
  
  content = content.replace(/getBookNotes/g, 'getPaperNotes');
  content = content.replace(/removeBookFile/g, 'removePaperFile');
  content = content.replace(/BookContent/g, 'PaperContent');
  content = content.replace(/bookTitle/g, 'paperTitle');
  content = content.replace(/bookAuthor/g, 'paperAuthors');
  content = content.replace(/BookChat/g, 'PaperChat');
  content = content.replace(/BookNotes/g, 'PaperNotes');
  content = content.replace(/EditBookModal/g, 'EditPaperModal');
  content = content.replace(/DeleteBookButton/g, 'DeletePaperButton');
  content = content.replace(/BookPage/g, 'PaperPage');

  content = content.replace(/bookId/g, 'paperId');
  content = content.replace(/book\.id/g, 'paper.id');
  content = content.replace(/currentBook/g, 'currentPaper');
  content = content.replace(/userBooks/g, 'userPapers');
  content = content.replace(/\bbook\b/g, 'paper');
  content = content.replace(/\bBook\b/g, 'Paper');
  content = content.replace(/\bbooks\b/g, 'papers');
  content = content.replace(/\bBooks\b/g, 'Papers');
  content = content.replace(/translations/g, 'paperTranslations'); // For schema

  content = content.replace(/from '\/books\/'/g, "from '/papers/'");

  fs.writeFileSync(destFile, content);
  console.log(`Copied and transformed ${file} to ${destFileName}`);
}
