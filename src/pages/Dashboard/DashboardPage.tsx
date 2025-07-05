import {
  Box,
  Divider
} from '@mui/material';
import KpiSection from '../../components/dashboard/KpiSection';
import PatientSection from '../../components/dashboard/PatientSection';
import GraphSection from '../../components/dashboard/GraphSection';
const DashboardPage = () => {
  return (
    <Box sx={{ p: 2 }}
    border={1}
    borderColor="divider"
    >
      <KpiSection />
      <Divider sx={{ my: 4 }} />
      <GraphSection />
      <Divider sx={{ my: 4 }} />
      <PatientSection />
    </Box>
  );
};
export default DashboardPage;
