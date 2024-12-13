import Row from "../ui/Row";
import Heading from "../ui/Heading";
import MetersTable from "../features/meters/MetersTable";
import AddMeter from "../features/meters/AddMeter";
import { useState } from "react";

function Meters() {
  const [numPages, setNumPages] = useState([]);

  const handleSetNumPages = (pages) => {
    setNumPages(pages);
  };
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All Meters</Heading>
      </Row>
      <Row>
        <MetersTable handleSetNumPages={handleSetNumPages} />
        {/* <AddMeter /> */}
      </Row>
    </>
  );
}

export default Meters;
