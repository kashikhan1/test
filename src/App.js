import { ToastContainer } from "react-toastify";
import CodeVerification from "./CodeVerification";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <CodeVerification />
      <ToastContainer />
    </div>
  );
}

export default App;
