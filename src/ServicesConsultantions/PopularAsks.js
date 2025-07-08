// PopularAsksPopup.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const popularAsksData = {
  Cardiology: [
    {
      question: "What are the early symptoms of heart disease?",
      answer: "Common symptoms include chest pain, shortness of breath, and fatigue.",
    },
    {
      question: "How often should I get my heart checked?",
      answer: "It is generally recommended to have an annual checkup if you have risk factors.",
    },
  ],
  Dermatology: [
    {
      question: "How can I manage severe acne?",
      answer: "A combination of topical treatments and medications may be recommended.",
    },
    {
      question: "What skincare routine is best for sensitive skin?",
      answer: "A gentle, fragrance-free cleanser and moisturizer are recommended.",
    },
  ],
  Orthopedics: [
    {
      question: "What are common treatments for joint pain?",
      answer: "Treatments may include physiotherapy, medications, and sometimes surgery.",
    },
    {
      question: "How long is the recovery after joint surgery?",
      answer: "Recovery varies from a few months to a year, depending on the procedure.",
    },
  ],
  // Add additional specifications and their Q&A as needed
};

const PopularAsksPopup = ({ open, onClose, specialization }) => {
  const data = popularAsksData[specialization] || [];
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Popular Asks for {specialization}</DialogTitle>
      <DialogContent dividers>
        {data.length > 0 ? (
          <List>
            {data.map((item, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {item.question}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2">
            No popular asks available for this specification.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopularAsksPopup;
