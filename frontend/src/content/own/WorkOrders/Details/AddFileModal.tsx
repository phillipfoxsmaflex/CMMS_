import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Form from '../../components/form';
import * as Yup from 'yup';
import { IField } from '../../type';
import { useDispatch } from '../../../../store';
import useAuth from '../../../../hooks/useAuth';
import FeatureErrorMessage from '../../components/FeatureErrorMessage';
import { PlanFeature } from '../../../../models/owns/subscriptionPlan';
import { uploadDocuments } from '../../../../slices/document';

interface AddFileProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
}

export default function AddFileModal({
                                       open,
                                       onClose,
                                       workOrderId
                                     }: AddFileProps) {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { hasFeature } = useAuth();
  
  const fields: Array<IField> = [
    {
      name: 'files',
      type: 'file',
      multiple: true,
      label: t('files'),
      fileType: 'file'
    }
  ];
  const shape = {
    files: Yup.array().required(t('required_field'))
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('add_file')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        {hasFeature(PlanFeature.FILE) ? (
          <Form
            fields={fields}
            validation={Yup.object().shape(shape)}
            submitText={t('add')}
            values={{}}
            onSubmit={async (values) => {
              const formattedValues = { ...values };
              await dispatch(
                uploadDocuments('WORK_ORDER', workOrderId, formattedValues.files)
              );
              onClose();
            }}
          />
        ) : (
          <FeatureErrorMessage message="Upgrade to add files to your Work Orders. " />
        )}
      </DialogContent>
    </Dialog>
  );
}
