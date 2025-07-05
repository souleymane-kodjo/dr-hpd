import {
  Box,
  Divider
} from '@mui/material';
import KpiSection from '../../components/dashboard/KpiSection';
import PatientSection from '../../components/dashboard/PatientSection';
const DashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <KpiSection />
      <Divider sx={{ my: 4 }} />
      <PatientSection />
    </Box>
  );
};
export default DashboardPage;
