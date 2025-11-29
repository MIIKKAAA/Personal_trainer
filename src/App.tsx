import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerTable from "./components/CustomerTable";
import TrainingTable from "./components/TrainingTable";

import { AppBar, Toolbar, Button, Container} from "@mui/material";


function App() {
  return (
    <Router>
        {/* Navbar */}
        <AppBar>
          <Toolbar>
            <Button component={Link} to="/customers" color="inherit">
              Customers
            </Button>
            <Button component={Link} to="/trainings" color="inherit">
              Trainings
            </Button>
          </Toolbar>
        </AppBar>

      {/* Layout */}
      <Container>
        <Routes>
          <Route path="/customers" element={<CustomerTable />} />
          <Route path="/trainings" element={<TrainingTable />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
