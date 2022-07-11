import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function CircularTimer(props) {
   const { maxSeconds, seconds } = props;

   const [remainingSeconds, setRemainingSeconds] = useState(seconds);
   const percentage = remainingSeconds/maxSeconds * 100;
   const closed = remainingSeconds === 0;

   const ss = String(remainingSeconds % 60).padStart(2, '0');
   const mm = String(Math.floor(remainingSeconds / 60));

   useEffect(() => {
      const intervalId = setInterval(() => {
            
         setRemainingSeconds(oldSeconds => {
            if (oldSeconds === 0) 
               clearInterval(intervalId);
               
            if (oldSeconds <= 0)
               return 0;

            return oldSeconds - 1;
         });
      }, 1000); // 1s
   }, []);

   const circleStyles = {
      text: {
         fill: `hsl(${percentage}, 100%, 30%)`, // Text color
         fontSize: '22px', // Text size
      }, 
      path: {
         // Path color
         stroke: `hsl(${percentage}, 100%, 30%)`
      }
   };

   return (
      <div style={{ width: 100, height: 100 }}>
         <CircularProgressbar value={percentage} text={closed ? `closed` : `${mm}:${ss}`} 
            strokeWidth={12} styles={circleStyles} />
      </div>
   );
}

export default CircularTimer;