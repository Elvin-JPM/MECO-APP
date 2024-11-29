import Row from "../ui/Row";
import Heading from "../ui/Heading";
import MetersTable from "../features/meters/MetersTable";
import AddMeter from "../features/meters/AddMeter";

function Meters() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All Meters</Heading>
      </Row>
      <Row>
        <MetersTable />
        <AddMeter />
      </Row>
    </>
  );
}

export default Meters;
