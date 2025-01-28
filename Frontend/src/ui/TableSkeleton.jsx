import { Table, TableHeader } from "../features/reports/ReportTable";
import ButtonArray from "./ButtonArray";
import Button from "./Button";
import { FaDownload } from "react-icons/fa6";
import PaginationWrapper from "./PaginationWrapper";
import MeasureRow from "../features/reports/MeasureRow";

const TableSkeleton = ({ energyTags, totalPages, pageNumber }) => {
  return (
    <Table role="table">
      <PaginationWrapper
        handleInputChange={() => {}}
        handlePageChange={() => {}}
        handleInputSubmit={() => {}}
        pageNumber={pageNumber ? pageNumber : 0}
        totalPages={totalPages ? totalPages : 0}
        inputValue={""}
      />
      <TableHeader role="row">
        <div>FECHA</div>
        {energyTags?.map((energyTag) => (
          <div key={energyTag}>{energyTag}</div>
        ))}
        <ButtonArray>
          <Button disabled={true} onClick={() => {}} tooltip="Descargar perfil">
            <FaDownload />
          </Button>
        </ButtonArray>
      </TableHeader>

      {/* Always show loading rows since this is a skeleton component */}
      {Array(6)
        .fill(null)
        .map((_, index) => (
          <MeasureRow key={index} isLoading={true} />
        ))}

      <PaginationWrapper
        handleInputChange={() => {}}
        handlePageChange={() => {}}
        handleInputSubmit={() => {}}
        pageNumber={pageNumber ? pageNumber : 0}
        totalPages={totalPages ? totalPages : 0}
        inputValue={""}
      />
    </Table>
  );
};

export default TableSkeleton;
