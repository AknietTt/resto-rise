import React from 'react';
import { Modal, Button } from 'antd';
import { ConfirmDeleteModalProps } from '@/types/Other';


const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Подтверждение удаления"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button  danger key="submit"  onClick={onConfirm}>
          Удалить
        </Button>,
      ]}
    >
      <p>Вы точно хотите удалить эту запись?</p>
    </Modal>
  );
};

export default ConfirmDeleteModal;
