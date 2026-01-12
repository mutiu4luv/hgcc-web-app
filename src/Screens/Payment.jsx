import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const PaymentScreen = ({ token }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ⭐ Read parameters from the URL
  const { cohortId, courseId } = useParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/api/payment/confirm`,
        {
          cohortId,
          courseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);

      // ⭐ redirect to WhatsApp
      const phone = "2349071651329";
      const text = encodeURIComponent(
        "Hello, I have made my payment. Here is my proof of payment."
      );

      window.location.href = `https://wa.me/${phone}?text=${text}`;
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
          After payment, click the button below to confirm and send proof via
          WhatsApp.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="success"
          sx={{ mt: 3, py: 1.4, fontSize: 17 }}
          disabled={loading}
          onClick={handleConfirmPayment}
        >
          {loading ? <CircularProgress size={26} /> : "I Have Paid"}
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
