export const getIndexOfMonth = (months, firstLast) => {
 
    let empty = true;
    let index = 0;
    if(firstLast === 'first'){
      while(empty && index < 12){
        if(months[index].activities.length > 0){
          empty = false;
        }else{
          index = index + 1
        }
      }
    }else{
      while(empty && index < 12){
        if(months[index].activities.length === 0){
          empty = false;
        }else{
          index = index + 1
        }
      }
    }
    return index;
  }

export const monthDiff = (d1, d2)=> {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}