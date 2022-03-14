import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

import * as d3 from 'd3';

import { getIndexOfMonth } from '../timeHelperFunctions';
import Activity from './Activity';
import { useProjectState } from './ProjectContext';

const CenterView = (projectProps: any) => {
  const { projectEntries, folderPath, timeFilter } = projectProps;

  const [{ filterTags, filterType }] = useProjectState();

  // SWITCH THIS TO THE PROJECTDATA
  const tagFilteredEntries = projectEntries
    .filter((entryData: any) => {
      return filterTags.every((requiredTag: string) =>
        entryData.tags.includes(requiredTag)
      );
    })
    .map((e, index) => ({ ...e, index }));

  const filteredEntries = tagFilteredEntries
    .filter((entryData: any) => {
      if (filterType) {
        return entryData.files.map((m: any) => m.fileType).includes(filterType);
      }
      return entryData;
    })
    .map((e, index) => ({ ...e, index }));

  const years = d3.groups(filteredEntries, (y) =>
    new Date(y.date).getFullYear()
  );

  const yearMonth = years
    .sort((a, b) => a[0] - b[0])
    .map((year, yi) => {
      const mon = d3.groups(year[1], (m) => new Date(m.date).getMonth());

      const wrapper = new Array(12).fill({}).map((m, i) => {
        const activ = mon.filter((f) => f[0] === i);
        const activity =
          activ.length > 0
            ? activ.flatMap((f) => {
                f[1] = f[1].map((a) => {
                  a.month = i;
                  a.year = year[0];
                  return a;
                });
                return f[1];
              })
            : [];
        if (activity.length > 0) {
          activity[0].firstMonth = true;
        }
        return { month: i, year: year[0], activities: activity };
      });

      return { year: year[0], months: wrapper };
    });

  /**
   * Trim the empty months in beginnign and end of timeline
   */
  const startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
  const endIndex = getIndexOfMonth(
    yearMonth[yearMonth.length - 1].months,
    'last'
  );
  yearMonth[0].months = yearMonth[0].months.filter(
    (f, i) => i > startIndex - 1
  );
  yearMonth[yearMonth.length - 1].months = yearMonth[
    yearMonth.length - 1
  ].months.filter((f, i) => i < endIndex);

  const flatActivities = yearMonth.flatMap((yr) =>
    yr.months.flatMap((mo) => mo.activities)
  );

  const getMonth = (activity: Object) => {
    const monthDict = [
      'Jan',
      'Feb',
      'March',
      'April',
      'May',
      'June',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthDict[activity.month];
  };

  const fAct =
    timeFilter != null
      ? flatActivities.filter(
          (f) =>
            new Date(f.date) >= timeFilter[0] &&
            new Date(f.date) <= timeFilter[1]
        )
      : flatActivities;

  return (
    <Flex flex="3" h="calc(100vh - 150px)" overflowY="auto">
      <div
        style={{
          display: 'flex',
          flexFlow: 'column wrap',
          height: filteredEntries.length > 50 ? 'calc(100vh - 250px)' : 'calc(100vh)',
        }}
      >
        {fAct.map((fa: any, i: number) => (
          <React.Fragment key={`fr-${fa.title}-${i}`}>
            {fa.firstMonth && (
              <Box
                key={`first-${fa.title}-${i}`}
                marginTop={7}
                textAlign="right"
                paddingRight={2}
              >{`${getMonth(fa)}`}</Box>
            ) }
            <Activity
              key={`${fa.title}-${i}`}
              activity={fa}
              folderPath={folderPath}
              index={i}
              numRendered={filteredEntries.length}
            />
          </React.Fragment>
        ))}
      </div>
    </Flex>
  );
};

export default CenterView;
