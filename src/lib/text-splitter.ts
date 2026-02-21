import { RecursiveCharacterTextSplitter, CharacterTextSplitter } from '@langchain/textsplitters';
import type { Chunk } from '@/stores/experiment-store';

export async function splitText(
  text: string,
  strategy: 'fixed' | 'recursive' | 'parent-child',
  chunkSize: number,
  overlapSize: number,
  separators: string[]
): Promise<Chunk[]> {
  const parsedSeparators = separators.map((s) =>
    s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
  );

  if (strategy === 'fixed') {
    const splitter = new CharacterTextSplitter({
      chunkSize,
      chunkOverlap: overlapSize,
      separator: parsedSeparators[0] || '\n\n',
    });
    const docs = await splitter.createDocuments([text]);
    return docs.map((doc, i) => {
      const startOffset = text.indexOf(doc.pageContent.slice(0, 50));
      return {
        id: `chunk-${i}`,
        content: doc.pageContent,
        index: i,
        startOffset: startOffset >= 0 ? startOffset : 0,
        endOffset: (startOffset >= 0 ? startOffset : 0) + doc.pageContent.length,
      };
    });
  }

  if (strategy === 'recursive') {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: overlapSize,
      separators: parsedSeparators,
    });
    const docs = await splitter.createDocuments([text]);
    let searchFrom = 0;
    return docs.map((doc, i) => {
      const idx = text.indexOf(doc.pageContent.slice(0, 50), searchFrom);
      const startOffset = idx >= 0 ? idx : searchFrom;
      searchFrom = startOffset + 1;
      return {
        id: `chunk-${i}`,
        content: doc.pageContent,
        index: i,
        startOffset,
        endOffset: startOffset + doc.pageContent.length,
      };
    });
  }

  // parent-child strategy
  const parentSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize * 2,
    chunkOverlap: overlapSize,
    separators: parsedSeparators,
  });
  const childSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlapSize,
    separators: parsedSeparators,
  });

  const parentDocs = await parentSplitter.createDocuments([text]);
  const allChunks: Chunk[] = [];
  let chunkIndex = 0;

  for (let pi = 0; pi < parentDocs.length; pi++) {
    const parentContent = parentDocs[pi].pageContent;
    const parentId = `parent-${pi}`;
    const childDocs = await childSplitter.createDocuments([parentContent]);

    for (const childDoc of childDocs) {
      const startOffset = text.indexOf(childDoc.pageContent.slice(0, 50));
      allChunks.push({
        id: `chunk-${chunkIndex}`,
        content: childDoc.pageContent,
        index: chunkIndex,
        startOffset: startOffset >= 0 ? startOffset : 0,
        endOffset: (startOffset >= 0 ? startOffset : 0) + childDoc.pageContent.length,
        parentId,
      });
      chunkIndex++;
    }
  }

  return allChunks;
}
