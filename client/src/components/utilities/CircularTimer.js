import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const MAX_NUM_OF_SECONDS = 99*60 + 59;

function CircularTimer(props) {
   let { maxSeconds, remainingSeconds, closed, className } = props;
   remainingSeconds = remainingSeconds > 0 ? remainingSeconds : 0;

   let percentage = remainingSeconds/maxSeconds * 100;

   if (percentage > 100)
      percentage = 100;

   let ss = String(remainingSeconds % 60).padStart(2, '0');
   let mm = String(Math.floor(remainingSeconds / 60));

   if (remainingSeconds > MAX_NUM_OF_SECONDS) {
      ss = "99";
      mm = "59";
   }

   const circleStyles = {
      text: {
         fill: `hsl(${percentage ? percentage : 0}, 100%, 30%)`, // Text color
         fontSize: '22px', // Text size
      }, 
      path: {
         // Path color
         stroke: `hsl(${percentage ? percentage : 0}, 100%, 30%)`
      }
   };

   return (
      <div style={{ width: 50, height: 50 }} className={className}>
         <CircularProgressbar value={closed ? 0 : percentage} text={closed ? `closed` : `${mm}:${ss}`} 
            strokeWidth={12} styles={circleStyles} />
      </div>
   );
}

export default CircularTimer;