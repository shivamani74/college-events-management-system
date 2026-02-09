import React from "react";
import { useParams } from "react-router-dom";
import EventDetails from "./EventDetails";

/**
 * This page ONLY handles payment
 * Event info is already known via eventId
 */
const EventPayment = () => {
  const { eventId } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>💳 Event Registration Payment</h2>

      {/* Reuse your existing payment logic */}
      {/* You can also move Razorpay logic here later */}
      <EventDetails isPaymentPage={true} eventId={eventId} />
    </div>
  );
};

export default EventPayment;
