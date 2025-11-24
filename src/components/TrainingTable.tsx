import { useState, useEffect } from "react";
import dayjs from "dayjs";

function TrainingTable() {
  type Training = {
    activity: string;
    date: string;
    duration: number;
    customer: {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      streetaddress: string;
      postcode: string;
      city: string;
    };
  };

  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    // fetch trainings from the REST API (https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/)
    const fetchTrainings = async () => {
        // try-catch block for error handling
      try {
        // fetch trainings from the API
        const response = await fetch(
          "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
        );
        // if response is not ok, throw an error
        if (!response.ok) {
          throw new Error("Failed to fetch trainings");
        }

        // else parse JSON data
        const data = await response.json();

        // Trainings are inside _embedded.trainings
        setTrainings(data._embedded?.trainings ?? []);
      } catch (error) {
        console.error("Error fetching trainings:", error);
      }
    };

    fetchTrainings();
  }, []);

  return (
    <div>
      <h2>Training List</h2>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Date</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map((t, index) => (
            <tr key={index}>
              <td>{t.activity}</td>
              <td>{dayjs(t.date).format("DD.MM.YYYY HH:mm")}</td>
              <td>{t.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrainingTable;
