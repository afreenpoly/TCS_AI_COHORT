import { useState } from "react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  const reviewCode = async () => {
    const response = await axios.post("http://127.0.0.1:8000/review", { code });

    setResult(response.data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Code Review System</h1>

      <textarea
        rows="15"
        cols="100"
        placeholder="Paste code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br />
      <br />

      <button onClick={reviewCode}>Review Code</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default App;
