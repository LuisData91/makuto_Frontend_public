import GeneralState from "./context/generalState";
import AdminRutas from "./routes/AdminRutas"

const App = () => {
  return (
    <GeneralState>
      <AdminRutas />
    </GeneralState>
  )
}

export default App;