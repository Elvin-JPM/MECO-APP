import { useState } from "react";
import Button from "../../ui/Button";
import CreateMeterForm from "./CreateMeterForm";
import Modal from "../../ui/Modal";
import { FaPlus } from "react-icons/fa6";

function AddMeter() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  function handleShowForm() {
    setShowForm((show) => !show);
  }
  return (
    <>
      <Button size="small" variation="secondary" onClick={() => setIsOpenModal((show) => !show)}>
        <FaPlus />
      </Button>
      {isOpenModal && (
        <Modal onClose={() => setIsOpenModal(false)}>
          <CreateMeterForm onCloseModal={() => setIsOpenModal(false)} />
        </Modal>
      )}
    </>
  );
}

export default AddMeter;
