import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Customers from "./pages/Customers.tsx";

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Default page */}
          <Route path="/" element={<Customers />} />
        </Routes>
      </div>
    </Router>
  );
}
