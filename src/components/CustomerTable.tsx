import {useState, useEffect} from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

function CustomerTable() {

  // Define type for customer (matches backend, id is generated from _links.self.href)
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

  // For DataGrid, we need an id field (string) for row identification
  type CustomerRow = Customer & { id: string };
  
  const [customers, setCustomers] = useState<CustomerRow[]>([]); // state for customers
  const [openDialog, setOpenDialog] = useState(false); // dialog state
  const [newCustomer, setNewCustomer] = useState<Customer>({ // initial empty customer
    firstname: "", lastname: "", email: "", phone: "", streetaddress: "", postcode: "", city: "", _links: { self: { href: "" } }
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // state for editing customer

  // Open and close dialog handlers
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  // Handle input changes for new customer
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  // Adding new customer
  const handleAddCustomer = async () => {
    try {
      // Exclude id for backend
      const {...customerData } = newCustomer;

      const response = await fetch(
        "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData)
        }
      );
  
      if (!response.ok) throw new Error("Failed to add new customer");
  
      const createdCustomer: Customer = await response.json();
  
      // Add new customer to DataGrid with id for DataGrid only
      setCustomers([...customers, { ...createdCustomer, id: createdCustomer._links.self.href }]);
      handleClose(); // Close dialog

      // Reset customer form in dialog
      setNewCustomer({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        streetaddress: "",
        postcode: "",
        city: "",
        _links: { self: { href: "" } }
      });

    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };


  // Delete customer
  const handleDeleteCustomer = async (href: string) => {
    const customer = customers.find(c => c._links.self.href === href);
    if (!customer) return;
    if (!window.confirm(`Delete customer ${customer.firstname} ${customer.lastname}?`)) return; // Confirm deletion
    try {
      // Delete request to backend
      const res = await fetch(customer._links.self.href, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete customer");
      // Remove customer from state
      setCustomers(customers.filter(c => c._links.self.href !== href));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch request to backend
        const response = await fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers");
        if (!response.ok) throw new Error("Failed to fetch customers");
        // Parse response and map to CustomerRow with id
        const data = await response.json();
        // Map customers to include id field for DataGrid
        const customersWithId: CustomerRow[] = (data._embedded?.customers ?? []).map((c: Customer) => ({
          ...c,
          id: c._links.self.href, // Add id for DataGrid only
        }));
        setCustomers(customersWithId);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

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
    { field: "city", headerName: "City"},
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: GridRenderCellParams) => ( // Render Edit and Delete buttons
        <>
          <Button
            onClick={() => handleEditClick(params.row)} // Edit button
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteCustomer(params.row._links.self.href)} // Delete button, links.self.href as id
          >
            Delete
          </Button>
        </>
      )
    }
  ];

// Edit button click
const handleEditClick = (customer: CustomerRow) => {
  // Copy customer without DataGrid-only id when editing
  const { id, ...backendCustomer } = customer; // Exclude id
  setEditingCustomer({ ...backendCustomer }); // Set editing customer
};

  // Handle changes in edit dialog
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCustomer) return;
    setEditingCustomer({ ...editingCustomer, [e.target.name]: e.target.value }); // Update field
  };

  // Handle saving edited customer
  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    try {
      // Exclude id for backend
      const {...customerData } = editingCustomer;

      // PUT request to update customer
      const res = await fetch(editingCustomer._links.self.href, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      // Check for errors
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update customer: ${text}`);
      }
      // Update customer in state
      setCustomers(prev =>
        prev.map(c =>
          c._links.self.href === editingCustomer._links.self.href
            ? { ...editingCustomer, id: editingCustomer._links.self.href }
            : c
        )
      );

      setEditingCustomer(null); // close dialog
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };

  // Return the DataGrid component with populated customer data
  return(
    <div>
      <Button onClick={handleOpen} style={{ marginBottom: "10px" }} >
        Add New Customer
      </Button>
    
      <div style={{ height: 500, width: '100%', margin: 'auto' }}>
        <DataGrid rows={customers} columns={columns} 
          getRowId={(row) => row._links.self.href} // id is links.self.href for DataGrid
        />
      </div>

      {/* Adding a new customer dialog */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            label="Firstname"
            name="firstname"
            value={newCustomer.firstname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Lastname"
            name="lastname"
            value={newCustomer.lastname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={newCustomer.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={newCustomer.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Street"
            name="streetaddress"
            value={newCustomer.streetaddress}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Postcode"
            name="postcode"
            value={newCustomer.postcode}
            fullWidth
          />
          <TextField
            label="City"
            name="city"
            value={newCustomer.city}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddCustomer} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog
        open={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <TextField
            label="Firstname"
            name="firstname"
            value={editingCustomer ? editingCustomer.firstname : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Lastname"
            name="lastname"
            value={editingCustomer ? editingCustomer.lastname : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={editingCustomer ? editingCustomer.email : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={editingCustomer ? editingCustomer.phone : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Street"
            name="streetaddress"
            value={editingCustomer ? editingCustomer.streetaddress : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Postcode"
            name="postcode"
            value={editingCustomer ? editingCustomer.postcode : ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="City"
            name="city"
            value={editingCustomer ? editingCustomer.city : ""}
            onChange={handleEditChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCustomer(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomerTable;
