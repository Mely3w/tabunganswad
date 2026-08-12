import React from 'react';

export default function HistoryScreen({ transactions }: any) {
  const formatRupiah = (amount: number) => {
    return "Rp " + amount.toLocaleString("id-ID");
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <h2 className="text-lg font-bold mb-4 text-foreground">Riwayat Transaksi</h2>
      
      {(!transactions || transactions.length === 0) ? (
        <p className="text-sm text-muted-foreground">Belum ada riwayat transaksi.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((item: any, index: number) => {
            const isIn = item.type === "in";
            return (
              <div key={index} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name || item.judul || "Transaksi"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.date || item.waktu || "Baru saja"}</p>
                </div>
                <p className={`text-sm font-bold ${isIn ? "text-green-600" : "text-red-500"}`}>
                  {isIn ? "+" : "-"}{formatRupiah(item.amount || 0)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
