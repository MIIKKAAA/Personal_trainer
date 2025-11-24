import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerTable from "./components/CustomerTable";
import TrainingTable from "./components/TrainingTable";

function App() {
  return (
    <Router>
      <div>
        {/* Nav bar */}
        <nav>
          <Link to="/customers" style={{ marginRight: "15px" }}>Customers</Link>
          <Link to="/trainings">Trainings</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/customers" element={<CustomerTable />} />
          <Route path="/trainings" element={<TrainingTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
