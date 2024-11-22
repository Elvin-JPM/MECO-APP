import Row from "../ui/Row";
import Heading from "../ui/Heading";
import MetersTable from "../features/meters/MetersTable";
import Button from "../ui/Button";
import { useState } from "react";
import CreateMeterForm from "../features/meters/CreateMeterForm";

function Meters() {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All Meters</Heading>
      </Row>
      <Row>
        <MetersTable />
        <Button onClick={() => setShowForm((show) => !show)}>
          Add new meter
        </Button>
        {showForm && <CreateMeterForm/>}
      </Row>
    </>
  );
}

export default Meters;
