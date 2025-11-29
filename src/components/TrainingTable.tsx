import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DataGrid} from "@mui/x-data-grid";
import type { GridColDef} from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";

function TrainingTable() {

  // Type for a training
  type Training = {
    activity: string;
    date: string;
    duration: number;
    customer?: { firstname: string; lastname: string; _links: { self: { href: string } } };
    _links: { self: { href: string }; customer?: { href: string } };
  };

  // DataGrid requires id
  type TrainingRow = Training & { id: string; customerName?: string };

  // State to store trainings
  const [trainings, setTrainings] = useState<TrainingRow[]>([]);
  const [customers, setCustomers] = useState<any[]>([]); // For selecting customer when adding/editing

  const [openDialog, setOpenDialog] = useState(false);
  const [newTraining, setNewTraining] = useState<Training>({
    activity: "",
    date: "",
    duration: 0,
    customer: undefined,
    _links: { self: { href: "" } }
  });
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  // Fetch trainings and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trainings from the REST API
        const resTrainings = await fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings");
        const dataTrainings = await resTrainings.json();

        // Map through trainings and fetch the linked customer for each
        const trainingsWithCustomer: TrainingRow[] = await Promise.all(
          (dataTrainings._embedded?.trainings ?? []).map(async (t: any) => {
            let customerName = "No customer"; // default value
            if (t._links.customer?.href) {
              try {
                const custRes = await fetch(t._links.customer.href); // fetch customer
                if (custRes.ok) { 
                  const custData = await custRes.json(); // parse JSON
                  customerName = `${custData.firstname} ${custData.lastname}`; // create full name
                }
              } catch (err) { 
                console.error("Error fetching customer for training:", err);
              }
            }
            // Return training with added id and customerName
            return {
              id: t._links.self.href, // unique id required by DataGrid
              activity: t.activity,
              date: t.date, 
              duration: t.duration,   
              customerName, 
              _links: t._links
            };
          })
        );

        setTrainings(trainingsWithCustomer);

        // Fetch customers for select dropdown
        const resCustomers = await fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers");
        const dataCustomers = await resCustomers.json();
        setCustomers(dataCustomers._embedded?.customers ?? []); // set customers state

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Open and close dialog handlers
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => {
    setOpenDialog(false);
    setNewTraining({
      activity: "",
      date: "",
      duration: 0,
      customer: undefined,
      _links: { self: { href: "" } }
    });
    setEditingTraining(null);
  };

  // Handle input changes for new training
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTraining({ ...newTraining, [e.target.name]: e.target.value }); //
  };

  // Handle changes in edit dialog
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingTraining) return;
    setEditingTraining({ ...editingTraining, [e.target.name]: e.target.value });
  };

  // Handle customer selection for add or edit
  const handleCustomerChange = (href: string) => {
    const selectedCustomer = customers.find(c => c._links.self.href === href);
    if (editingTraining) {
      setEditingTraining({ ...editingTraining, customer: selectedCustomer });
    } else {
      setNewTraining({ ...newTraining, customer: selectedCustomer });
    }
  };

  // Adding new training
  const handleAddTraining = async () => {
    try {
      const trainingData: any = {
        activity: newTraining.activity,
        date: newTraining.date,
        duration: newTraining.duration,
        customer: newTraining.customer?._links.self.href
      };
      // Post to REST API
      const res = await fetch("https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainingData)
      });

      // Check for errors
      if (!res.ok) throw new Error("Failed to add training");

      // Get created training from response
      const createdTraining = await res.json();

      // Add new training to DataGrid
      setTrainings([
        ...trainings,
        {
          ...createdTraining,
          id: createdTraining._links.self.href,
          customerName: newTraining.customer ? `${newTraining.customer.firstname} ${newTraining.customer.lastname}` : "No customer"
        }
      ]);

      handleClose();

    } catch (err) {
      console.error("Error adding training:", err);
    }
  };

  // Edit button click
  const handleEditClick = (training: TrainingRow) => {
    const { id, customerName, ...backendTraining } = training;
    setEditingTraining({ ...backendTraining });
    setOpenDialog(true);
  };

  // Handle saving edited training
  const handleSaveEdit = async () => {
    if (!editingTraining) return; // check if editingTraining is set
    try {
      // Prepare data for PUT request
      const trainingData: any = {
        activity: editingTraining.activity,
        date: editingTraining.date,
        duration: editingTraining.duration,
        customer: editingTraining.customer?._links.self.href
      };

      // Send PUT request to update training
      const res = await fetch(editingTraining._links.self.href, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainingData)
      });

      if (!res.ok) throw new Error("Failed to update training");

      // Update training in state
      setTrainings(prev =>
        prev.map(t =>
          t._links.self.href === editingTraining._links.self.href
            ? { ...editingTraining, id: editingTraining._links.self.href, customerName: editingTraining.customer ? `${editingTraining.customer.firstname} ${editingTraining.customer.lastname}` : "No customer" }
            : t
        )
      );

      handleClose();
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };

  // Delete training
  const handleDeleteTraining = async (href: string) => {
    if (!window.confirm("Delete this training?")) return; // confirmation
    try {
      // Send DELETE request
      const res = await fetch(href, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete training");
      // Remove training from state
      setTrainings(trainings.filter(t => t._links.self.href !== href));
    } catch (err) {
      console.error(err);
    }
  };

// Define columns for DataGrid
const columns: GridColDef[] = [
  { field: "activity", headerName: "Activity", flex: 2, minWidth: 150 },

  {
    field: "date", headerName: "Date", flex: 1, minWidth: 150,
    renderCell: (params: any) =>
      params.row?.date ? dayjs(params.row.date).format("DD.MM.YYYY HH:mm") : ""
  },
  { field: "duration", headerName: "Duration (mins)", flex: 1, minWidth: 150 },
  { field: "customerName", headerName: "Customer", flex: 1, minWidth: 150 },
  {
    field: "actions", headerName: "Actions", flex: 1, minWidth: 200,
    renderCell: (params: any) => (
      <>
        <Button onClick={() => handleEditClick(params.row)}>Edit</Button>
        <Button onClick={() => handleDeleteTraining(params.row._links.self.href)}>
          Delete
        </Button>
      </>
    )
  }
];


  // Return DataGrid with populated training data
  return (
    <div>
      <Button onClick={handleOpen} style={{ marginBottom: 10 }}>Add New Training</Button>
      <div style={{ height: 500, width: "100%", margin: "auto" }}>
        <DataGrid
          rows={trainings} // rows are trainings with id and customerName
          columns={columns} // columns defined above
        />
      </div>

      {/* Add/Edit Training Dialog */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>{editingTraining ? "Edit Training" : "Add New Training"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Activity"
            name="activity"
            value={editingTraining?.activity || newTraining.activity}
            onChange={editingTraining ? handleEditChange : handleChange}
            fullWidth
          />
          <TextField
            label="Date"
            name="date"
            type="datetime-local"
            value={editingTraining
              ? dayjs(editingTraining.date).format("YYYY-MM-DDTHH:mm")
              : newTraining.date
                ? dayjs(newTraining.date).format("YYYY-MM-DDTHH:mm")
                : ""}
            onChange={editingTraining ? handleEditChange : handleChange}
            fullWidth
          />

          <TextField
            label="Duration (mins)"
            name="duration"
            type="number"
            value={editingTraining?.duration || newTraining.duration}
            onChange={editingTraining ? handleEditChange : handleChange}
            fullWidth
          />
          <TextField
            select
            label="Customer"
            value={editingTraining?.customer?._links.self.href || newTraining.customer?._links.self.href || ""}
            onChange={(e) => handleCustomerChange(e.target.value)}
            fullWidth
          >
            <MenuItem value="">No customer</MenuItem>
            {customers.map(c => (
              <MenuItem key={c._links.self.href} value={c._links.self.href}>
                {c.firstname} {c.lastname}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={editingTraining ? handleSaveEdit : handleAddTraining} color="primary">
            {editingTraining ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TrainingTable;
