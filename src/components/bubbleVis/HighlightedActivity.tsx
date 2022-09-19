import React from 'react';
import * as d3 from 'd3';
import { useProjectState } from '../ProjectContext';

export const HighlightedActivity = (props: any) => {
  const {
    event,
    onActivityColor,
    filterRT,
    filterType,
    filterTags,
    selectedActivityURL,
    mousedOverActivity,
    setMousedOverActivity,
    setToolPosition,
    setHoverData,
  } = props;

  const [{hoverActivity}] = useProjectState();

  let fill = onActivityColor;
  let opacity = 1;
  let strokeWidth = 0.4;
  let stroke = '#d3d3d3';

  if (filterType) {
    fill = 'gray';
    opacity = 0.5;
    strokeWidth = 0;
  } else if (filterTags.length > 0) {
    fill = 'gray';
    opacity = 0.5;
    strokeWidth = 0;
  } else if (selectedActivityURL) {
    fill = 'red';
    opacity = 0.5;
    strokeWidth = 1;
  }

  if (mousedOverActivity) {
    if (filterRT && mousedOverActivity === event) {
      stroke = 'gray';
      strokeWidth = 2;
    } else if (filterType || filterTags.length > 0) {
      if (mousedOverActivity === event) {
        stroke = 'gray';
        strokeWidth = 1;
      } else if (selectedActivityURL) {
        stroke = 'red';
        strokeWidth = 1;
        opacity = 1;
      } else {
        fill = 'gray';
        // TODO: child artifacts should have fill '#fff'
      }
    }
  }

  // highlight events when moused-over in the panel on the right
  if (hoverActivity && hoverActivity.activity_uid === event.activity_uid) {
    fill = 'goldenrod';
  }

  const onMouseOver = (ev) => {
    setToolPosition([event.x, event.y]);
    setHoverData(event);
    setMousedOverActivity(event);

    // TODO: convert?
    /*
    if (filterRT) {
      let activities = d3
        .selectAll('.list-activity')
        .filter((f, i, n) => {
          return n[i].innerText.includes(d.title);
        });

      const elementPosition = document
        .getElementById(`threaded-${d.activity_uid}`)
        .getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;

      if (activities.nodes().length > 0) {
        activities.nodes()[0].scrollIntoView({
          behavior: 'smooth',
          // block: 'center',
          top: offsetPosition
        });
      }
    }

    d3.select(`#threaded-${d.activity_uid}`).style(
      'background-color',
      '#fed758'
    );

     */
  };

  const onMouseOut = () => {
    setMousedOverActivity(null); // sets tooltip visibility

    // TODO: convert
    /*
                  d3.select(
                    `#threaded-${d3.select(event.target).data()[0].activity_uid}`
                  ).style('background-color', '#fff');
     */
  };

  const onClick = () => {
    const el = document.getElementById(`${filterRT ? "threaded" : "unthreaded"}-${event.activity_uid}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <g className="activity" transform={`translate(${event.x}, ${event.y})`}>
      <circle
        className="all-activities"
        style={{cursor: 'pointer' }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        r={event.radius}
        cx={0}
        cy={0}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onClick={onClick}
      />

      {event.files.map((artifact, i) => (
        <React.Fragment key={`art-${artifact.title}`}>
          <HighLightedArtifact
            artifact={artifact}
            filterType={filterType}
            selectedActivityURL={selectedActivityURL}
            mousedOverActivity={mousedOverActivity}
          />
        </React.Fragment>
        
      ))}
    </g>
  );
};
const HighLightedArtifact = (props) => {
  const {
    artifact,
    filterType,
    selectedActivityURL,
    mousedOverActivity,
  } = props;

  let fill = 'gray';
  let opacity = 1;

  if (filterType) {
    fill = artifact.artifactType === filterType ? 'gray' : '#fff';
    opacity = artifact.artifactType === filterType ? 1 : 0.7;
  }

  if (selectedActivityURL && mousedOverActivity) {
    fill = 'white';
  }

  // TODO: adjust this to work here
  /*
  researchThreads?.research_threads[filterRT?.rtIndex].evidence.forEach(
    (f) => {
      let temp = highlightedActivityGroups.filter(
        (ha) => ha.title === f.activityTitle
      );

      const chosenActivityData = temp.select('.all-activities').data()[0];

      if (f.type === 'activity') {
        temp.select('.all-activities').attr('fill', onActivityColor);

        temp.selectAll('circle.artifact').attr('fill', onArtifactColor);
      } else if (f.type === 'artifact' || f.type === 'fragment') {
        temp
          .selectAll('circle.artifact')
          .filter((art) => art.title === f.artifactTitle)
          .attr('fill', onArtifactColor);
        temp
          .select('circle.all-activities')
          .attr('fill', onActivityColor);
      }
    }
  );

   */

  return (
    <circle
      className="artifact"
      style={{cursor: 'pointer' }}
      r={3}
      cx={artifact.x}
      cy={artifact.y}
      fill={fill}
      opacity={opacity}
    />
  );
};
