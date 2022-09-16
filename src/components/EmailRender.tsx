import React, { useEffect, useState } from 'react';
import * as Showdown from 'showdown';
import { readFileSync } from '../fileUtil';
import { useProjectState } from './ProjectContext';

const EmailRender = (props: any) => {
  const { title } = props;
  const [{ folderPath }] = useProjectState();

  const [emailData, setEmailData] = useState<null|any>(null);

  useEffect(() => {
    readFileSync(`${folderPath}/${title}`).then((eml) => {
      let test = eml.split('Date:').filter((f, i) => i != 0);

      let parsed = test.map((m, i) => {
        let stringTemp = `Date: ${m}`;

        return stringTemp;
      });

      setEmailData(parsed);
    });
  }, [title]);

  return (
    // <div
    // style={{ height: '95%', overflow: 'auto' }}
    // dangerouslySetInnerHTML={{__html: emailData}}
    // />
    emailData ? (
      <div
        style={{
          width: '700px',
          overflow: 'auto',
          marginRight: '60px',
          margin: '10px',
        }}
      >
        {/* <div dangerouslySetInnerHTML={{__html: emailData}} /> */}
        {emailData.map((em, i) => (
          <div
          key={`email-${i}`}
          >{em}</div>
        ))}
      </div>
    ) : "Email failed to load."
  );
};

export default EmailRender;
