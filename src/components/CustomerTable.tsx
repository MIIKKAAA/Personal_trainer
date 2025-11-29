import {useState, useEffect} from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

function CustomerTable() {

  // Define type for customer
  type Customer = {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    streetaddress: string;
    postcode: string;
    city: string;
    _links: {
      self: {
        href: string;
      };
    };
  };
  

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // fetch customers from the REST API (https://juhahinkula.github.io/personaltrainerdocs/)
    const fetchCustomers = async () => {
      // try-catch block for error handling
      try {
        const response = await fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers"  
        );
        // if response is not ok, throw an error
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        // else parse JSON data
        const data = await response.json();
        // debugging, remove later
        console.log("Full API response:", data);
        
        // map through customers to add 'id' field, links.self.href as id (should be unique)
        const customersWithId = (data._embedded?.customers ?? []).map((customer: Customer) => ({
          ...customer,
          id: customer._links.self.href
        }));
        
        setCustomers(customersWithId);
        
      // catch any errors, log to console
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    
    };
    // Call the fetchCustomers function
    fetchCustomers();
  }, []);


  // Define columns for DataGrid
  const columns: GridColDef[] = [
    { field: "firstname", headerName: "Firstname"},
    { field: "lastname", headerName: "Lastname"},
    { field: "email", headerName: "Email"},
    { field: "phone", headerName: "Phone"},
    { field: "streetaddress", headerName: "Street"},
    { field: "postcode", headerName: "Postcode"},
    { field: "city", headerName: "City"}
  ];

  // Return the DataGrid component with populated customer data
  return(
    <div style={{ height: 500, width: '100%', margin: 'auto' }}>
      <DataGrid rows={customers} columns={columns} />
    </div>
  )
}

export default CustomerTable;