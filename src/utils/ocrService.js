import Tesseract from 'tesseract.js';

export const runOCR = async (imageFile, onProgressOrEngine) => {
  const onProgress = typeof onProgressOrEngine === 'function' ? onProgressOrEngine : null;
  const result = await Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: m => {
        if (m.status === 'recognizing' && onProgress) {
          onProgress(m.progress);
        }
      }
    }
  );
  return {
    text: result?.data?.text || '',
    exitCode: 1,
    errorMessage: ''
  };
};

export const runOfflineOCR = async (imageFile, onProgress) => {
  const result = await Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: m => {
        if (m.status === 'recognizing' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      }
    }
  );
  return result?.data?.text || '';
};

export const mergeOCRTexts = (textA, textB) => {
  if (!textA) return textB;
  if (!textB) return textA;

  const linesA = textA.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const linesB = textB.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const base = linesA.length >= linesB.length ? linesA : linesB;
  const other = linesA.length >= linesB.length ? linesB : linesA;

  const baseSet = new Set(base.map(l => l.toLowerCase()));
  const extras = other.filter(l => !baseSet.has(l.toLowerCase()));

  return [...base, ...extras].join('\n');
};
