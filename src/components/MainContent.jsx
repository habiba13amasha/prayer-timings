
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Prayers from './prayers';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { axios } from 'axios';
import { useState,useEffect } from 'react';
import moment from 'moment';
import "moment/dist/locale/ar-dz"
moment.locale("ar"); //to convert date to arabic
export default function MainContent() {
  const[remainingTime,setremainigTime]=useState("");
  const[prayerIndex,setprayerIndex]=useState();
  const allPrayers=[
    {key:"Fajr",displayName:"الفجْر"},
    {key:"Dhuhr",displayName:"الظُّهْر"},
    {key:"Asr",displayName:"العَصر"},
    {key:"Maghrib",displayName:"المَغرب"},
    {key:"Isha",displayName:"العِشاء"}
  ]
  const[today,settoday]=useState("");
  const [selectedcity,setselectedcity]=useState({
    displayName:"القاهرة",
    apiName:"Cairo"
  });


  const city=[{ displayName:"القاهرة",apiName:"Cairo"},
              { displayName:"الاسكندرية", apiName:"Al-Eskandriya"},
              {displayName:"الدقهلية",apiName:"Dakhliya"},
              {displayName:"الشرقية",apiName:"Al-sharqyia"},
              {displayName:"الغربية",apiName:"Al-gharpyia"}
            ]
  const [time, settime] = useState();
  
  useEffect(()=>{
    axios.get(`https://api.aladhan.com/v1/timingsByCity/29-01-2024?country=Egypt&city=${selectedcity.apiName}`)
     .then((res)=>res.json())
     .then((data)=>settime(data));

    let t =moment().format('MMMM Do YYYY | h:mm:ss a');
    settoday(t);
    const count= setInterval(()=>{
      setupCountdownTimer();
    },1000);
    return()=>{
       clearInterval(count);
    }

  },[selectedcity])
  
  const setupCountdownTimer=()=>{
    const timeNow=moment();
    let prayerIndex;
    if(timeNow.isAfter(moment(time.data.timings['Fajr']),"hh:mm")&& timeNow.isBefore( moment(time.data.timings['Dhuhr']),"hh:mm")){
      prayerIndex=1;
    }else if(timeNow.isAfter(moment(time.data.data.timings['Dhuhr']),"hh:mm")&& timeNow.isBefore( moment(time.data.timings['Asr']),"hh:mm")){
      prayerIndex=2;
    }else if(timeNow.isAfter(moment(time.data.data.timings['Asr']),"hh:mm")&& timeNow.isBefore( moment(time.data.timings['Maghrib']),"hh:mm")){
      prayerIndex=3;
    }else if(timeNow.isAfter(moment(time.data.data.timings['Maghrib']),"hh:mm")&& timeNow.isBefore( moment(time.data.timings['Isha']),"hh:mm")){
      prayerIndex=4;
    }
    else{
      prayerIndex=0;    
    } 
    setprayerIndex(prayerIndex);
    const prayerKey=allPrayers[prayerIndex].key ;
    const prayerTime=time.data.timings[prayerKey];
    let remainingTime= moment(prayerTime,"hh:mm:ss").diff(timeNow);
    if(remainingTime<0){
      const midNightDiff=moment("23:59","hh:mm:ss").diff(timeNow);
      const fajrToMidNightDiff=moment(prayerTime,"hh:mm:ss").diff(moment("00:00","hh:mm:ss"));
      const totalDiff=midNightDiff + fajrToMidNightDiff
      remainingTime=totalDiff;
    }
    const durationRemainingTime=moment.duration(remainingTime);
    setremainigTime(`${durationRemainingTime.seconds()}:${durationRemainingTime.minutes()}:${durationRemainingTime.hours()}`)

  }
   
 
  
  const handleCityChange = (event) => {
    const findedCity=city.find(()=>{
      return city.apiName===event.target.value
    })
    setselectedcity(findedCity );
    
  };
  return (
    <>
    {/* Top Row */}
     <Grid container>
        <Grid xs={6}>
             <div>
                <h2>{today}</h2>  
                <h1>{selectedcity.displayName}</h1>
              
             </div>
        </Grid>
        <Grid xs={6}>
             <div>
                <h2 >متبقي حتى صلاة {allPrayers[prayerIndex].displayName} </h2>
                <h1>{remainingTime}</h1>
             </div>
        </Grid>
        {/* middel line */}
        <Divider style={{backgroundColor:"white" , opacity:"0.1"}} />
        {/* prayers cards */}
        {time.map((time)=>{
          return(
             <Stack direction="row" spacing={2} style={{marginTop:"50px"}} key={time.code}>
              <Prayers name= "Al_Fajr Prayers" time={time.data.timings.Fajr} image="../fajr-prayer.png"/>
              <Prayers name=" Al_duher Prayers" time={time.data.timings.Dhuhr} image="../dhhr-prayer-mosque.png" />
              <Prayers name=" Al_Asr Prayers" time={time.data.timings.Asr} image="../asr-prayer-mosque.png"/>
              <Prayers name=" Al_Maghreb Prayers" time={time.data.timings.Maghrib} image="../sunset-prayer-mosque.png"/>
              <Prayers name=" Al_Eshaa Prayers" time={time.data.timings.Isha} image="../night-prayer-mosque.png"/>
             </Stack>
         )})}
       {/* select prayers */}
       <Stack direction={'row'} style={{justifyContent:"center" ,marginTop:"40px"}}>
         <FormControl style={{width:"20%" ,backgroundColor:"aqua"}}>
          <InputLabel id="demo-simple-select-label"><span style={{color:"white"}}>Country</span></InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            //value={prayer}
            label="Country"
            onChange={handleCityChange}
        >
          {city.map((city)=>{
            return(
              <MenuItem value={city.apiName} key={city.apiName}>{city.displayName}</MenuItem>
            )
          })}
          
        </Select>
      </FormControl>
       </Stack>
     </Grid>
    </>
  )
}
