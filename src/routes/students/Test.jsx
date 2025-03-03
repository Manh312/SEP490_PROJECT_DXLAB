import { useEffect, useState } from "react";

const Test = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://localhost:7101/api/Role", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>API Response</h1>
      {data.length > 0 ? (
        <ul>
          {data.map((role, index) => (
            <li key={index}>{role.roleName}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Test;