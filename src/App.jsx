import GeneralState from "./context/generalState";
import AdminRutas from "./routes/AdminRutas";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <GeneralState>
      <AdminRutas />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // o "dark"
      />
      
    </GeneralState>
  )
}

export default App;