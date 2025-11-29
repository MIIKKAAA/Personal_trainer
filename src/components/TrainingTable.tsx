import { useState, useEffect } from "react";
import dayjs from "dayjs";

import { DataGrid} from "@mui/x-data-grid";

function TrainingTable() {

  // Type for a training
  type Training = {
    id: string; // DataGrid requires id
    activity: string;
    date: string;
    duration: number;
    customer?: { // customer can be null 
      firstname: string;
      lastname: string;
    };
    _links: {
      self: {
        href: string;
      };
    };
    customerName?: string; // field for DataGrid (firstname + lastname)
  };

  // State to store trainings
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    // Fetch trainings from the REST API
    const fetchTrainings = async () => {
      try {
        const response = await fetch(
          "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch trainings");
        }
  
        // Parse JSON data
        const data = await response.json();
  
        // Map through trainings and fetch the linked customer for each
        const trainingsWithCustomer = await Promise.all(

          // Map through trainings
          (data._embedded?.trainings ?? []).map(async (t: any) => {
            let customerName = "No customer"; // default value
  
            // If the training has a customer link, fetch the customer data
            if (t._links.customer?.href) {
              try {
                const custRes = await fetch(t._links.customer.href); // fetch customer
                if (custRes.ok) { // if response ok
                  const custData = await custRes.json(); // parse JSON
                  customerName = `${custData.firstname} ${custData.lastname}`; // create full name
                }
              } catch (err) { // catch fetch errors
                console.error("Error fetching customer for training:", err);
              }
            }

            // Create a new object for each training row
            const trainingRow = {
              id: t._links.self.href, // unique id required by DataGrid, links.self.href is used
              activity: t.activity,   // copy activity from original training
              date: t.date,           // copy date
              duration: t.duration,   // copy duration
              customerName: customerName // first + last name
            };

            // Return the new object
            return trainingRow;

          })
        );
  
        // Set trainings with customer names
        setTrainings(trainingsWithCustomer);
  
      } catch (error) {
        console.error("Error fetching trainings:", error);
      }
    };
  
    fetchTrainings();
  }, []);
  

  // Define columns for DataGrid
  const columns = [
    { field: "activity", headerName: "Activity", flex: 1 },

    {
      field: "date", headerName: "Date",
      // Format date using dayjs for display
      valueFormatter: (params: any) =>
        params.value ? dayjs(params.value).format("DD.MM.YYYY HH:mm") : ""
    },
    { field: "duration", headerName: "Duration (mins)"},
    {
      field: "customerName", headerName: "Customer"
    }
  ];

  // Return DataGrid with populated training data
  return (
    <div style={{ height: 500, width: "100%", margin: "auto" }}>
      <DataGrid
        rows={trainings} // rows are trainings with id and customerName
        columns={columns} // columns defined above
      />
    </div>
  );
}

export default TrainingTable;
