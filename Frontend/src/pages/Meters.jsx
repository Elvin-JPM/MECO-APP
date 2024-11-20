import Row from "../ui/Row";
import Heading from "../ui/Heading";
import MetersTable from "../features/meters/MetersTable";

function Meters() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All Meters</Heading>
      </Row>
      <Row>
        <MetersTable />
      </Row>
    </>
  );
}

export default Meters;
