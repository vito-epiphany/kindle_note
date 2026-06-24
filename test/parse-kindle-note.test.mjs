import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseKindleSource } from '../scripts/lib/parse-kindle-note.mjs';

test('parses Kindle txt exports into one normalized book', async () => {
  const raw = await readFile('test/fixtures/kindle-sample.txt', 'utf8');
  const result = parseKindleSource(raw, { path: 'test/fixtures/kindle-sample.txt' });

  assert.equal(result.warnings.length, 0);
  assert.equal(result.books.length, 1);
  assert.equal(result.books[0].title, 'Deep Work');
  assert.equal(result.books[0].author, 'Cal Newport');
  assert.equal(result.books[0].notes.length, 3);
  assert.equal(result.books[0].notes[0].quote, 'Focus deeply on cognitively demanding tasks.');
  assert.equal(result.books[0].notes[0].location, 'Location 42');
});

test('parses simple HTML and EML bodies', async () => {
  const html = await readFile('test/fixtures/kindle-sample.html', 'utf8');
  const eml = await readFile('test/fixtures/kindle-sample.eml', 'utf8');

  assert.equal(parseKindleSource(html, { path: 'sample.html' }).books[0].notes.length, 2);
  assert.equal(parseKindleSource(eml, { path: 'sample.eml' }).books[0].notes.length, 1);
});

test('parses Chinese Kindle Notebook HTML exports', async () => {
  const raw = await readFile('test/fixtures/kindle-notebook-cn.html', 'utf8');
  const result = parseKindleSource(raw, { path: 'kindle-notebook-cn.html' });

  assert.equal(result.warnings.length, 0);
  assert.equal(result.books.length, 1);
  assert.equal(result.books[0].title, '以日为鉴 衰退时代生存指南');
  assert.equal(result.books[0].author, '分析师Boden');
  assert.equal(result.books[0].notes.length, 2);
  assert.equal(result.books[0].notes[0].quote, '大宗商品代表信心，信心又代表什么呢');
  assert.equal(result.books[0].notes[0].note, '');
  assert.equal(result.books[0].notes[0].chapter, '第二章 救老员工，还是大学生？');
  assert.equal(result.books[0].notes[0].page, '第 8 页');
  assert.equal(result.books[0].notes[0].location, '位置 87');
  assert.equal(result.books[0].notes[1].quote, '在经历了接近一年半的横盘之后，日本土地价格终于支撑不住。');
  assert.equal(result.books[0].notes[1].note, '可以看看现在房价和企业利润的关系');
  assert.equal(result.books[0].notes[1].chapter, '第二章 救老员工，还是大学生？');
  assert.equal(result.books[0].notes[1].page, '第 24 页');
  assert.equal(result.books[0].notes[1].location, '位置 314');
});

test('reports unsupported input without throwing', async () => {
  const raw = await readFile('test/fixtures/unsupported.txt', 'utf8');
  const result = parseKindleSource(raw, { path: 'unsupported.txt' });

  assert.deepEqual(result.books, []);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].reason, 'No Kindle highlight blocks found');
});
