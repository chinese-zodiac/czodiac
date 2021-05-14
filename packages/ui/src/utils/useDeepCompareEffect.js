import { useEffect, useRef } from "react";
import isDeepEqual from 'fast-deep-equal/react';

function useDeepCompareMemoize(value) {
  const ref = useRef() 
  // it can be done by using useMemo as well
  // but useRef is rather cleaner and easier

  if (!isDeepEqual(value, ref.current)) {
    ref.current = value
  }

  return ref.current
}

function useDeepCompareEffect(callback, dependencies) {
  useEffect(
    callback,
    dependencies.map(useDeepCompareMemoize)
  )
}

export default useDeepCompareEffect;