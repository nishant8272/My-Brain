export function random(len){
  let options ="dskvjzblnzjn2463fs54rc4r154a83ggfgkjsa7685354dzsc5v4f50";
  let length = options.length;
  let ans="";
  for (let i=0;i<len;i++){
    ans+= options[Math.floor((Math.random()*length))]   
  }
  return ans
}