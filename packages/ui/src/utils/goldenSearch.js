const gr_precision = 1000000000
const gr = Math.floor(gr_precision * (Math.sqrt(5) + 1) / 2);

export const gssBnAsync = async (f,a,b,tol,maxIter) => {
  let c = b.sub(b.sub(a).mul(gr_precision).div(gr));
  let d = a.add(b.sub(a).mul(gr_precision).div(gr));
  let iter = 0;   
  while (b.sub(a).abs().gt(tol) && (iter < maxIter)) {
    let fc = await f(c);
    let fd = await f(d);
    if(fc.lt(fd)) {
      b = d;
    } else {
      a = c;
    }

    c = b.sub(b.sub(a).mul(gr_precision).div(gr));
    d = a.add(b.sub(a).mul(gr_precision).div(gr));

    iter++;
  }
  return a; //return lower bound
}