import { retext } from 'retext';
import retextPos from 'retext-pos';
import retextKeywords from 'retext-keywords';
import path from 'path';
import { readFileSync } from './fileUtil';

export const TextFileHandler = (fileList, folderPath) => {

  fileList.forEach((fi) => {
    // const file = readFileSync(path.join(folderPath, fi.name));
    const filePath = path.join(folderPath, fi.name);
    const fileContents = readFileSync(filePath, { encoding: 'utf-8' });

    retext()
      .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
      .use(retextKeywords)
      .process(fileContents)
      .then((file) => {
        console.log('Keywords:');
        file.data.keywords.forEach((keyword) => {
          console.log(toString(keyword.matches[0].node));
        });

      });
  });

  // let textData;

  // return textData;
};
