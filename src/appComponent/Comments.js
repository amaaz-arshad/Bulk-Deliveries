const remarks = new Map([
    [1, 'Gas filled properly'],
    [2, 'Closed all walls'],
    [3, 'Tanker leakage'],
    [4, 'VIE leakage'],
  ]);
  
  export function getComment(additionalRemarks, tdlsRemarks) {
    const remarksArray = [];
  
    if (additionalRemarks) {
      remarksArray.push(additionalRemarks);
    }
  
    if (tdlsRemarks && tdlsRemarks.length > 0) {
      tdlsRemarks.forEach((item) => {
        const remark = isNaN(item) ? remarks.get(item.RemarksMasterID) : remarks.get(item);
        if (remark) {
          remarksArray.push(remark);
        }
      });
    }
  
    return remarksArray.join('; ');
  }
  