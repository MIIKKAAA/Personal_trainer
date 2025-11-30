import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import "../Calendar.css";

// Training type
type Training = {
  activity: string;
  date: string;
  duration: number;
  customer?: { firstname: string; lastname: string };
};

// CalendarPage component
function CalendarPage() {
  const [trainings, setTrainings] = useState<Training[]>([]); // State for trainings

  // Fetch trainings from API
  useEffect(() => {
    fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings")
      .then(res => res.json()) // Parse JSON response
      .then(data => { // Handle data
        setTrainings(data._embedded?.trainings ?? []); // Set trainings state
      });
  }, []);

  // Map trainings to FullCalendar event format
  const events = trainings.map(t => ({
    title: `${t.activity} - ${t.customer?.firstname ?? ""} ${t.customer?.lastname ?? ""}`, // Event title
    start: t.date, // Event start date
    end: new Date(new Date(t.date).getTime() + t.duration * 60000), // Event end date, duration in minutes
  }));

  return (
    // Calendar component
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        contentHeight="auto" // Adjust height automatically
        nowIndicator={true} // Shows current time with a line
      />
    </div>
  );
}

export default CalendarPage;
