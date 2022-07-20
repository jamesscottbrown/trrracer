import React, { useEffect, useState } from 'react';
import { useProjectState } from './ProjectContext';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
// import * as fs from 'fs';
// import path from 'path';

const EmailRender = (props: any) => {
  const { title, setFragSelected, artifactData, activityData } = props;

  console.log('artifactData', artifactData, activityData);

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  const [state] = useProjectState();
  const [emailData, setEmailData] = useState('Email failed to load');

  useEffect(() => {
    if (activityData.description) {
      setEmailData(activityData.description);
    }
  }, [title]);

  //   var eml = fs.readFileSync(path.join(state.folderPath, title), "utf-8");
  //     emlformat.read(eml, function(error, data) {
  //       if (error) return console.log(error);
  //       // fs.writeFileSync("sample.json", JSON.stringify(data, " ", 2));
  //       console.log('data',data);
  // });

  // const sendToFlask = async () => {
  //   const response = await fetch(
  //     `http://127.0.0.1:5000/parse_eml/${title}/${state.projectData.title}`
  //   );
  //   const newData = await response.text();
  //   setEmailData(newData.split('>').filter((f) => f != ''));
  // };

  // sendToFlask();

  //   new EmlParser(fs.createReadStream(`${path.join(state.folderPath, title)}`))
  // .parseEml()
  // .then(result  => {
  // 	// properties in result object:
  // 	// {
  // 	//	"attachments": [],
  // 	//	"headers": {},
  // 	//	"headerLines": [],
  // 	//	"html": "",
  // 	//	"text": "",
  // 	//	"textAsHtml": "",
  // 	//	"subject": "",
  // 	//	"references": "",
  // 	//	"date": "",
  // 	//	"to": {},
  // 	//	"from": {},
  // 	//	"cc": {},
  // 	//	"messageId": "",
  // 	//	"inReplyTo": ""
  // 	// }
  // 	console.log('RESULT',result.html);
  //   setEmailData(result.html)
  // })
  // .catch(err  => {
  // 	console.log(err);
  // })

  return (
    // <div
    // style={{ height: '95%', overflow: 'auto' }}
    // dangerouslySetInnerHTML={{__html: emailData}}
    // />

    <ReactMde
      value={emailData}
      // onChange={setValue}
      selectedTab={'preview'}
      onTabChange={() => null}
      generateMarkdownPreview={(markdown) =>
        Promise.resolve(converter.makeHtml(markdown))
      }
      readOnly={true}
      style={{ height: '100%', overflowY: 'scroll' }}
    />
    // <div style={{ height: '90%', overflow: 'auto' }}>
    //   {emailData.map((m, i) => (
    //     <div
    //       key={`email-${i}`}
    //       style={{ display: 'block' }}
    //       onMouseUp={() => {
    //         if (setFragSelected) {
    //           const selObj = window.getSelection();
    //           console.log('test', selObj);
    //           setFragSelected(selObj?.toString());
    //         } else {
    //           console.log('mouseup');
    //         }
    //       }}
    //     >
    //       {m}
    //     </div>
    //   ))}
    // </div>
  );
};

export default EmailRender;
