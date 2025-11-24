import {useState, useEffect} from "react";


function CustomerTable() {

  type Customer = {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    streetaddress: string;
    postcode: string;
    city: string;
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
        console.log("Full API response:", data);
        
        // set customers state with the fetched data: 
        // "The response is a JSON object with a _embedded field containing an array of customers"
        setCustomers(data._embedded?.customers ?? []);
        
      // catch any errors, log to console
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    
    };
    // Call the fetchCustomers function
    fetchCustomers();
}, []);



return (
  <div>
    <h2>Customer List</h2>
    <table>
      <thead>
        <tr>
          <th>Firstname</th>
          <th>Lastname</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Street Address</th>
          <th>Postcode</th>
          <th>City</th>
        </tr>
      </thead>
      <tbody>
        {/* Map through customers and use index as key */}
        {customers.map((c, index) => (
          <tr key={index}>
            <td>{c.firstname}</td>
            <td>{c.lastname}</td>
            <td>{c.email}</td>
            <td>{c.phone}</td>
            <td>{c.streetaddress}</td>
            <td>{c.postcode}</td>
            <td>{c.city}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

export default CustomerTable;