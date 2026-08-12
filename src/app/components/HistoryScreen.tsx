import React from 'react';
export default function HistoryScreen({ transactions }: { transactions: any[] }) {
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="p-4">
      {transactions.map((item, index) => (
        <div key={index} className="border-b py-2">
          {/* Sesuaikan dengan struktur data transaksi Anda */}
          <p className="font-semibold">{item.judul || "Transaksi"}</p>
          <p className="text-sm text-gray-500">{item.tanggal || "Baru saja"}</p>
          <p className="text-red-500 font-bold">{item.jumlah}</p>
        </div>
      ))}
    </div>
  );
}
