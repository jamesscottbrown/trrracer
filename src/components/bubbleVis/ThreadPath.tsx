import * as d3 from 'd3';
import React from 'react';

export const ThreadPath = (props) => {
  const { filterRT, researchThreads, highlightedNodes } = props;

  if (
    filterRT &&
    researchThreads?.research_threads[filterRT?.rtIndex].evidence.length > 0
  ) {
    let linkDataBefore = [];
    let linkDataAfter = [];

    //
    const researchThread = researchThreads?.research_threads[
      filterRT?.rtIndex
    ].actions.filter((f) => f.action === 'created')[0];

    const divideDate = new Date(researchThread.when);

    console.log('filterRT:', filterRT);
    console.log('highlightedNodes:', highlightedNodes);
    console.log(
      'Evidence:',
      researchThreads?.research_threads[filterRT?.rtIndex].evidence
    );

    const activityNamesToHighlight = researchThreads?.research_threads[
      filterRT?.rtIndex
    ].evidence.map((e) => e.activityTitle);

    for (const activity of highlightedNodes) {
      if (!activityNamesToHighlight.includes(activity.title)) {
        continue;
      }

      if (new Date(activity.date) < divideDate) {
        linkDataBefore.push({
          coord: [activity.x, activity.y],
          date: activity.date,
        });
      } else {
        linkDataAfter.push({
          coord: [activity.x, activity.y],
          date: activity.date,
        });
      }
    }

    const lineGenerator = d3.line();

    let pathStringSolid;
    if (linkDataAfter.length > 0) {
      linkDataAfter = linkDataAfter.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      pathStringSolid = lineGenerator(linkDataAfter.map((m) => m.coord));
    }

    let pathStringDash;
    if (linkDataBefore.length > 0) {
      linkDataBefore = linkDataBefore.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      if (linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0]);

      pathStringDash = lineGenerator(linkDataBefore.map((m) => m.coord));
    }

    return (
      <>
        {linkDataBefore.length > 0 && (
          <path
            d={pathStringDash}
            fill="none"
            stroke={researchThreads?.research_threads[filterRT?.rtIndex].color}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
        {linkDataAfter.length > 0 && (
          <path
            d={pathStringSolid}
            fill="none"
            stroke={researchThreads?.research_threads[filterRT?.rtIndex].color}
            strokeWidth={2}
          />
        )}
      </>
    );
  }

  return null;
};
