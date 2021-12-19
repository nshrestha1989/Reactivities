import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { Container} from "semantic-ui-react";
import { Activity } from "../models/Activity";
import NavBar from "./NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";
import {v4 as uuid} from 'uuid';
import agent from "../api/agent";
import LoadingComponent from "./LoadingCompnents";

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity|undefined>(undefined)
  const[editMode,setEditMode]=useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting , setSubmiiting] = useState(false)

  useEffect(() => {
    agent.Activities.list().then((response) => {
      let activities:Activity[]=[];
      response.forEach(activity=>{
        activity.date=activity.date.split('T')[0];
        activities.push(activity);
      })
         setActivities(activities);
         setLoading(false);
      });
  }, []);

  function HandleSelectActivity(id:string) {
    setSelectedActivity(activities.find(x=>x.id===id));
    
  }

  function HandleCancelSelectedActivity() {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?:string){
    id?HandleSelectActivity(id):HandleCancelSelectedActivity();
    setEditMode(true);
  }

  function handleFormClose() {
    setEditMode(false);
  }

  function handleCreateorEditActivity(activity:Activity) {
    setSubmiiting(true);
    if(activity.id){
      agent.Activities.update(activity).then(()=>{
        setActivities([...activities.filter(x=>x.id !==activity.id),activity])
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmiiting(false);
      })
    }else{
      activity.id=uuid();
      agent.Activities.create(activity).then(()=>{
        setActivities([...activities,activity]);
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmiiting(false);
      })

    }
      }

  function handleDeleteActivity(id :string) {
    setSubmiiting(true);
    agent.Activities.delete(id).then(()=>{
      setActivities([...activities.filter(x=>x.id !==id)]);
      setSubmiiting(false);
    });
  
    
  }
  if(loading) return<LoadingComponent content='Loading app' />
  return (
    <Fragment>
      <NavBar openForm={handleFormOpen} />
      <Container style={{ marginTop: "7em" }}>
      <ActivityDashboard 
      activities={activities}
      selectedActivity={selectedActivity}
      selectActivity={HandleSelectActivity}
      cancelSelectActivity={HandleCancelSelectedActivity}
      editMode={editMode}
      openForm={handleFormOpen}
      closeForm={handleFormClose}
      createOrEdit={handleCreateorEditActivity}
      deleteActivity={handleDeleteActivity}
      submitting={submitting}
      />
      </Container>
    </Fragment>
  );
}

export default App;
