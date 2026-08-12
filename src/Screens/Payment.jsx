import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";

const PaymentScreen = ({ token }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ⭐ Read parameters from the URL
  const { cohortId, courseId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState(null);

  const handleConfirmPayment = async () => {
    if (!proof) {
      setMessage("Please upload your proof of payment first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("proof", proof);

      const res = await axios.post(
        `${BASE_URL}/api/cohort/student/register-cohort/${cohortId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message);
      setProof(null);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          💳 Payment Information
        </Typography>

        <Typography sx={{ mt: 3, fontSize: 18 }}>
          <strong>Account Number:</strong> 0102263405 <br />
          <strong>Bank:</strong> Sterling Bank <br />
          <strong>Account Name:</strong> HGSC2 DIGITAL SKILLS ACADEMY LTD
        </Typography>

        <Typography sx={{ mt: 2, color: "gray" }}>
          After payment, upload your proof below so the owner can review it in
          the dashboard.
        </Typography>

        <Button component="label" variant="outlined" fullWidth sx={{ mt: 3 }}>
          Upload Proof of Payment
          <input
            hidden
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProof(e.target.files?.[0] || null)}
          />
        </Button>

        {proof && (
          <TextField
            fullWidth
            margin="normal"
            value={proof.name}
            InputProps={{ readOnly: true }}
          />
        )}

        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 3, py: 1.4, fontSize: 17 }}
          disabled={loading}
          onClick={handleConfirmPayment}
        >
          {loading ? <CircularProgress size={26} /> : "Submit Payment Proof"}
        </Button>

        {message && (
          <Alert sx={{ mt: 3 }} severity="info">
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentScreen;
