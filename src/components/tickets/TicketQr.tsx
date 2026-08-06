"use client";

import QRCode from "react-qr-code";

interface TicketQrProps {
  value: string;
  size?: number;
}

export function TicketQr({ value, size = 200 }: TicketQrProps) {
  return (
    <div
      className="inline-block rounded-xl bg-white p-3"
      aria-label={`QR code ${value}`}
    >
      <QRCode value={value} size={size} bgColor="#ffffff" fgColor="#0a0a0a" />
    </div>
  );
}
