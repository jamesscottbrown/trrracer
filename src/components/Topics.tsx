import { Badge, Heading } from '@chakra-ui/layout';
import React from 'react';

const Topics = (props: any) => {
  const { topics } = props;

  const splitTops = (topicBlob) => {
    const vals = topicBlob.split(' + ').map((m) => {
      return m.split('*');
    });
    console.log(vals);

    return vals;
  };

  const getColor = (val) => {
    console.log(+val > 0.04);
    if (+val > 0.04) {
      return 'gray.500';
    } else if (+val <= 0.04 && +val > 0.01) {
      return 'gray.300';
    } else {
      return 'gray.100';
    }
  };

  return (
    <div>
      <Heading as="h5">Topics</Heading>
      {topics.map((top) => (
        <div key={`top-${top[0]}`} style={{ padding: '10px' }}>
          <Heading as="h6" size="md">
            Topic {top[0] + 1}
          </Heading>
          {splitTops(top[1]).map((t) => (
            <Badge style={{ margin: '5px' }} bg={getColor(t[0])}>
              {t[1]}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Topics;
