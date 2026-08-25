
(function(){
  const KEY="stemSchoolProgress", VERSION=2;
  const LESSONS={
    lesson_one:{title:"📊 Finance & AI Literacy",activities:["finance-math","finance-vocabulary","finance-practice","finance-reflection","finance-stem"]},
    lesson_two:{title:"📈 Functions & Graphs",activities:["functions-graphs","functions-vocabulary","functions-practice","functions-stem","functions-english"]},
    lesson_three:{title:"🥗 Digital Recipe & Cost Analysis",activities:["recipe-analysis","recipe-math","recipe-sheet","recipe-english","recipe-stem"]},
    lesson_four:{title:"🧮 Digital Budget Planner",activities:["budget-income","budget-expenses","budget-sheet","budget-english","budget-reflection"]}
  };
  function fresh(){
    const lessons={};
    Object.keys(LESSONS).forEach(id=>lessons[id]={completed:[],lastActivity:null});
    return {version:VERSION,lessons,streak:0,lastActivityDate:null,totalActivities:0,lastLesson:null};
  }
  function load(){
    try{
      const raw=localStorage.getItem(KEY); if(!raw)return fresh();
      const data=JSON.parse(raw); const base=fresh();
      if(!data || !data.lessons)return base;
      Object.keys(base.lessons).forEach(id=>{
        if(data.lessons[id]) base.lessons[id]={
          completed:Array.isArray(data.lessons[id].completed)?data.lessons[id].completed.filter(x=>LESSONS[id].activities.includes(x)):[],
          lastActivity:data.lessons[id].lastActivity||null
        };
      });
      return {...base,...data,version:VERSION,lessons:base.lessons};
    }catch(e){return fresh();}
  }
  function save(data){localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent("progresschange",{detail:data}));}
  function today(){return new Date().toISOString().slice(0,10)}
  function updateStreak(data){
    const now=today();
    if(!data.lastActivityDate)data.streak=1;
    else if(data.lastActivityDate!==now){
      const prev=new Date(data.lastActivityDate+"T00:00:00"),cur=new Date(now+"T00:00:00");
      const days=Math.round((cur-prev)/86400000); data.streak=days===1?data.streak+1:1;
    }
    data.lastActivityDate=now;
  }
  function complete(lessonId,activityId){
    const data=load(), lesson=data.lessons[lessonId];
    if(!lesson || !LESSONS[lessonId].activities.includes(activityId))return;
    if(!lesson.completed.includes(activityId)){lesson.completed.push(activityId);data.totalActivities++}
    lesson.lastActivity=activityId; data.lastLesson=lessonId; updateStreak(data); save(data);
  }
  function uncomplete(lessonId,activityId){
    const data=load(), lesson=data.lessons[lessonId];
    if(!lesson)return;
    lesson.completed=lesson.completed.filter(x=>x!==activityId);
    if(data.totalActivities>0)data.totalActivities--;
    save(data);
  }
  function isComplete(l,a){return load().lessons[l]?.completed.includes(a)||false}
  function lessonProgress(id){
    const lesson=LESSONS[id]; if(!lesson)return 0;
    const done=load().lessons[id]?.completed.length||0;
    return Math.round(done/lesson.activities.length*100);
  }
  function overallProgress(){
    const total=Object.values(LESSONS).reduce((s,l)=>s+l.activities.length,0);
    const done=Object.values(load().lessons).reduce((s,l)=>s+(l.completed?.length||0),0);
    return total?Math.round(done/total*100):0;
  }
  function stats(){
    const data=load(),total=Object.values(LESSONS).reduce((s,l)=>s+l.activities.length,0);
    const completed=Object.values(data.lessons).reduce((s,l)=>s+(l.completed?.length||0),0);
    const completedLessons=Object.keys(LESSONS).filter(id=>lessonProgress(id)===100).length;
    return {total,completed,completedLessons,overall:total?Math.round(completed/total*100):0,streak:data.streak||0,lastLesson:data.lastLesson};
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(load(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="stem-school-progress.json";a.click();URL.revokeObjectURL(url);
  }
  function importData(file){
    const reader=new FileReader();
    reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!incoming||!incoming.lessons)throw 0;localStorage.setItem(KEY,JSON.stringify({...incoming,version:VERSION}));location.reload()}catch(e){alert("Не вдалося імпортувати файл прогресу.")}};
    reader.readAsText(file);
  }
  window.Progress={LESSONS,load,save,complete,uncomplete,isComplete,lessonProgress,overallProgress,stats,exportData,importData};
})();
