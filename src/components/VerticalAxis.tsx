import * as d3 from 'd3';

export const dataStructureForTimeline = (activityData: any) => {
  const years = d3.groups(activityData, (y: any) =>
    new Date(y.date).getFullYear()
  );

  return years
    .sort((a: any, b: any) => a[0] - b[0])
    .map((year: any) => {
      const mon = d3.groups(year[1], (m: any) => new Date(m.date).getMonth());

      const wrapper = new Array(12).fill({}).map((_, i) => {
        const activ = mon.filter((f: any) => f[0] === i);
        const allActivities =
          activ.length > 0
            ? activ.flatMap((f: any) => {
                f[1] = f[1].map((a: any) => {
                  a.month = i;
                  a.year = year[0];
                  return a;
                });
                return f[1];
              })
            : [];
        if (allActivities.length > 0) {
          allActivities[0].firstMonth = true;
        }
        return { month: i, year: year[0], activities: allActivities };
      });

      return { year: year[0], months: wrapper };
    });
};
