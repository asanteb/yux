import { useState } from "react";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello There!</h1>
      <div>
        <h4>Count: {count}</h4>
        <button onClick={() => setCount(count + 1)}>Update Count</button>
      </div>
    </div>
  );
};

export default App;
