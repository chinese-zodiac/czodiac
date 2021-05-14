import { useEffect, useState } from "react";

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

function useCountdown(finalUTC,endMessage) {
    const [value, setValue] = useState(null);

    useEffect(()=>{
        if(!finalUTC) return;
        let delta = Number(finalUTC.toString()) - Math.floor(Date.now() / 1000);
        if(delta < 0) {
            setValue(endMessage);
            return;
        }
        const updateTime = ()=>{
            if(!finalUTC) return;
            const currentUTC = Math.floor(Date.now() / 1000);
            delta = Number(finalUTC.toString()) - currentUTC;
            let newValue = "";
            if(delta < 0) {
                newValue = endMessage
            } else {
                const days = Math.floor(delta/86400);
                const hours =Math.floor(delta/3600)-days*24;
                const minutes = Math.floor(delta/60)-days*24*60-hours*60;
                const seconds = delta-days*24*60*60-hours*60*60-minutes*60;
                newValue = `${pad(days, 2)}d ${pad(hours, 2)}h ${pad(minutes, 2)}m ${pad(seconds, 2)}s`
            }
            setValue(newValue);
        }        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return ()=>clearInterval(interval);
    },[finalUTC,endMessage]);

    return value;
}

export default useCountdown;