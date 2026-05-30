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
        rows={20}
        cols={100}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
      />

      <br />
      <br />

      <button onClick={reviewCode}>Review Code</button>

      <br />
      <br />

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default App;
