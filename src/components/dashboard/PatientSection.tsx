import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircularProgress,
  Typography,

  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Pagination,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Button,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { getPatients } from '../../services/patientService';
import type { Patient } from '../../types';
import { Link } from 'react-router-dom';


// ---------- PATIENT SECTION ----------
const PatientSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  });

  const specialties = useMemo(() => {
    if (!patients || patients.length === 0) return [];

    const all = patients
      .filter((p: Patient) => p && p.specialty) // Filtrer les patients valides avec spécialité
      .map((p: Patient) => p.specialty);
    return Array.from(new Set(all)).sort();
  }, [patients]);

  // const filteredPatients = patients.filter(
  //   (patient: Patient) =>
  //     (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (patient.bedNumber !== undefined && patient.bedNumber.toString().includes(searchTerm))) &&
  //     (specialtyFilter === '' || patient.specialty === specialtyFilter)
  // );
  const filteredPatients = patients.filter((patient: Patient) => {
    // Vérifications de sécurité pour éviter les erreurs
    if (!patient || !patient.name) return false;

    const nameMatch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const bedNumberMatch = patient.bedNumber !== undefined &&
                          patient.bedNumber.toString().includes(searchTerm);
    const specialtyMatch = specialtyFilter === '' ||
                          (patient.specialty && patient.specialty === specialtyFilter);

    return (nameMatch || bedNumberMatch) && specialtyMatch;
  });

  const paginatedPatients = filteredPatients.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Erreur lors du chargement des patients</Typography>;

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Typography variant="h6" fontWeight={600}>
          Patients hospitalisés
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            placeholder="Rechercher un patient..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ maxWidth: 400 }}
          />

          <Select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 200, borderRadius: 2 }}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 1, ml: 0.5 }}>
                <FilterIcon fontSize="small" color="action" />
              </InputAdornment>
            }
          >
            <MenuItem value="">Toutes spécialités</MenuItem>
            {specialties.map((spec) => (
              <MenuItem key={spec} value={spec}>{spec}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date d'admission</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Spécialité</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>N° de lit</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        width: 40,
                        height: 40,
                        fontSize: 14
                      }}>
                        {patient.name ? patient.name.split(' ').map(n => n[0]).join('') : '?'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>{patient.name || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.age ? `${patient.age} ans` : 'Âge non renseigné'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{patient.admissionDate || 'Non renseignée'}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.specialty || 'Non définie'}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{patient.bedNumber ?? '—'}</TableCell>
                  <TableCell>

                      <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/patients/${patient.id}/medical-record`}>Voir dossier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Aucun patient ne correspond à votre recherche
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Affichage de {filteredPatients.length} patients sur {patients.length} au total
        </Typography>
        <Pagination
          count={Math.ceil(filteredPatients.length / rowsPerPage)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default PatientSection;