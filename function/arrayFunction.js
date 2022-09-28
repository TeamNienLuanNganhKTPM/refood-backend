const intersection = (arr1, arr2) => {
    const res = [];
    let array1 = new Set(arr1);
    let array2 = new Set(arr2);
    for(let i = 0; i < arr1.length; i++){
       if(!array1.has(array2[i])){
          continue;
       };
       res.push(arr1[i]);
    };
    return res;
 };
 const intersectMany = (...arrs) => {
    let res = arrs[0].slice();
    for(let i = 1; i < arrs.length; i++){
       res = intersection(res, arrs[i]);
    };
    return res;
 };
module.exports = intersectMany;